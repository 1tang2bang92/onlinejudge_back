import { SetMetadata } from '@nestjs/common'
import { ROLE_KEY, Roles } from './role.decorate'

// Mock SetMetadata to track calls
jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}))

const mockSetMetadata = SetMetadata as jest.MockedFunction<typeof SetMetadata>

describe('Role Decorator', () => {
  beforeEach(() => {
    mockSetMetadata.mockReset()
  })

  describe('ROLE_KEY constant', () => {
    it('should export ROLE_KEY with correct value', () => {
      expect(ROLE_KEY).toBe('roles')
      expect(typeof ROLE_KEY).toBe('string')
    })
  })

  describe('Roles decorator function', () => {
    it('should create metadata with single role', () => {
      const mockDecorator = Object.assign(jest.fn(), { KEY: 'roles' }) as any
      mockSetMetadata.mockReturnValue(mockDecorator)

      const result = Roles('admin')

      expect(mockSetMetadata).toHaveBeenCalledWith('roles', ['admin'])
      expect(result).toBe(mockDecorator)
    })

    it('should create metadata with multiple roles', () => {
      const mockDecorator = Object.assign(jest.fn(), { KEY: 'roles' }) as any
      mockSetMetadata.mockReturnValue(mockDecorator)

      const result = Roles('admin', 'professor', 'student')

      expect(mockSetMetadata).toHaveBeenCalledWith('roles', ['admin', 'professor', 'student'])
      expect(result).toBe(mockDecorator)
    })

    it('should create metadata with empty roles array', () => {
      const mockDecorator = Object.assign(jest.fn(), { KEY: 'roles' }) as any
      mockSetMetadata.mockReturnValue(mockDecorator)

      const result = Roles()

      expect(mockSetMetadata).toHaveBeenCalledWith('roles', [])
      expect(result).toBe(mockDecorator)
    })

    it('should handle CMS-relevant roles', () => {
      const mockDecorator = Object.assign(jest.fn(), { KEY: 'roles' }) as any
      mockSetMetadata.mockReturnValue(mockDecorator)

      // CMS에서 사용될 역할들
      const cmsRoles = ['content_editor', 'content_viewer', 'admin', 'moderator']
      const result = Roles(...cmsRoles)

      expect(mockSetMetadata).toHaveBeenCalledWith('roles', cmsRoles)
      expect(result).toBe(mockDecorator)
    })
  })

  describe('Integration with SetMetadata', () => {
    it('should call SetMetadata with correct parameters', () => {
      const mockDecorator = Object.assign(jest.fn(), { KEY: 'roles' }) as any
      mockSetMetadata.mockReturnValue(mockDecorator)

      Roles('admin')

      expect(mockSetMetadata).toHaveBeenCalledWith(ROLE_KEY, ['admin'])
    })

    it('should pass roles as array to SetMetadata', () => {
      const mockDecorator = Object.assign(jest.fn(), { KEY: 'roles' }) as any
      mockSetMetadata.mockReturnValue(mockDecorator)

      Roles('role1', 'role2')

      const [key, value] = mockSetMetadata.mock.calls[0]
      expect(key).toBe('roles')
      expect(Array.isArray(value)).toBe(true)
      expect((value as string[]).every(role => typeof role === 'string')).toBe(true)
    })
  })

  describe('CMS role management', () => {
    it('should support workspace-based roles', () => {
      const mockDecorator = Object.assign(jest.fn(), { KEY: 'roles' }) as any
      mockSetMetadata.mockReturnValue(mockDecorator)

      // CMS workspace 역할
      Roles('workspace_owner', 'workspace_member', 'content_contributor')

      expect(mockSetMetadata).toHaveBeenCalledWith('roles', [
        'workspace_owner', 
        'workspace_member', 
        'content_contributor'
      ])
    })

    it('should support content permission roles', () => {
      const mockDecorator = Object.assign(jest.fn(), { KEY: 'roles' }) as any
      mockSetMetadata.mockReturnValue(mockDecorator)

      // CMS 콘텐츠 권한
      Roles('content_create', 'content_read', 'content_update', 'content_delete')

      expect(mockSetMetadata).toHaveBeenCalledWith('roles', [
        'content_create', 
        'content_read', 
        'content_update', 
        'content_delete'
      ])
    })
  })
})
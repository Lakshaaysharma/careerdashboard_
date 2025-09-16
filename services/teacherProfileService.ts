import { TeacherSetupData } from '@/components/ui/teacher-hierarchy-form'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export interface TeacherProfile {
  instituteName: string
  className: string
  subjects: string[]
  section: string
  courses: {
    name: string
    description: string
    level: string
    isActive: boolean
    createdAt: string
  }[]
  batchYear: string
  isProfileComplete: boolean
  profileCompletedAt?: string
}

export interface TeacherProfileStats {
  totalSubjects: number
  totalCourses: number
  activeCourses: number
  profileCompletion: number
}

export interface TeacherProfileResponse {
  success: boolean
  message?: string
  data: {
    profile: TeacherProfile
    stats: TeacherProfileStats
  }
}

export interface CourseData {
  name: string
  description?: string
  level?: string
}

export interface AddCourseResponse {
  success: boolean
  message: string
  data: {
    course: any
    stats: TeacherProfileStats
  }
}

class TeacherProfileService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  async getProfile(): Promise<TeacherProfileResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher-profiles/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching teacher profile:', error)
      throw error
    }
  }

  async updateProfile(profileData: TeacherSetupData): Promise<TeacherProfileResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher-profiles/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating teacher profile:', error)
      throw error
    }
  }

  async updateProfileField(field: string, value: any): Promise<TeacherProfileResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher-profiles/profile`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ [field]: value }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating profile field:', error)
      throw error
    }
  }

  async addCourse(courseData: CourseData): Promise<AddCourseResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher-profiles/courses`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(courseData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error adding course:', error)
      throw error
    }
  }

  async updateCourse(courseId: string, courseData: CourseData): Promise<AddCourseResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher-profiles/courses/${courseId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(courseData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating course:', error)
      throw error
    }
  }

  async removeCourse(courseId: string): Promise<{ success: boolean; message: string; data: { stats: TeacherProfileStats } }> {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher-profiles/courses/${courseId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error removing course:', error)
      throw error
    }
  }

  // Helper method to save complete profile data
  async saveCompleteProfile(profileData: TeacherSetupData): Promise<TeacherProfileResponse> {
    try {
      // First, update the complete profile
      const result = await this.updateProfile(profileData)
      
      // You can add additional logic here if needed
      // For example, syncing with other services, etc.
      
      return result
    } catch (error) {
      console.error('Error saving complete profile:', error)
      throw error
    }
  }
}

export const teacherProfileService = new TeacherProfileService()
export default teacherProfileService

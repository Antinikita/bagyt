import { vi } from 'vitest'

export const sanctumRequest = vi.fn()

export const mockComplaints = [
  { id: 1, complaint: "Service has been down for 3 days", created_at: "2025-12-02T00:00:00Z", user_id: 1 }
]

vi.mock('../../config/sanctumRequest', () => ({
  sanctumRequest
}))

export default sanctumRequest

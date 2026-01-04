import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ComplaintsList from './ComplaintsList'
import { sanctumRequest, mockComplaints } from '../test/mocks/sanctumRequest'

vi.mock('../../config/sanctumRequest')

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('ComplaintsList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading spinner initially', () => {
    renderWithRouter(<ComplaintsList />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows empty state when there are no complaints', async () => {
    sanctumRequest.mockResolvedValueOnce({ data: [] })

    renderWithRouter(<ComplaintsList />)
    await waitFor(() => {
      expect(screen.getByText('No complaints yet')).toBeInTheDocument()
    })
  })

  it('displays complaints from API', async () => {
    sanctumRequest.mockResolvedValueOnce({ data: mockComplaints })

    renderWithRouter(<ComplaintsList />)
    await waitFor(() => {
      expect(screen.getByText(/Service has been down/i)).toBeInTheDocument()
    })
  })

  it('opens add modal', async () => {
    sanctumRequest.mockResolvedValueOnce({ data: [] })

    renderWithRouter(<ComplaintsList />)
    fireEvent.click(screen.getByRole('button', { name: /add new complaint/i }))
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('adds a complaint successfully', async () => {
    sanctumRequest.mockResolvedValueOnce({ data: [] })
    sanctumRequest.mockResolvedValueOnce({ data: { id: 2 } })

    renderWithRouter(<ComplaintsList />)

    fireEvent.click(screen.getByRole('button', { name: /add new complaint/i }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'New complaint text' } })
    fireEvent.click(screen.getByText(/add complaint/i))

    await waitFor(() => {
      expect(sanctumRequest).toHaveBeenCalledWith('post', '/complaints', { complaint: 'New complaint text' })
    })
  })

  it('deletes a complaint on click', async () => {
    sanctumRequest.mockResolvedValueOnce({ data: mockComplaints })
    sanctumRequest.mockResolvedValueOnce({ data: {} })

    renderWithRouter(<ComplaintsList />)
    await waitFor(() => {
      expect(screen.getByText(/Service has been down/i)).toBeInTheDocument()
    })

    vi.spyOn(window, 'confirm').mockReturnValue(true)
    fireEvent.click(screen.getByTitle('Delete complaint'))

    await waitFor(() => {
      expect(sanctumRequest).toHaveBeenCalledWith('delete', `/complaints/1`)
    })
  })
})

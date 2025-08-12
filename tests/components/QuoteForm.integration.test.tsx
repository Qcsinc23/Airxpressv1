// tests/components/QuoteForm.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuoteForm from '../../app/components/quote/QuoteForm';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('QuoteForm Integration Tests', () => {
  const mockOnSubmit = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('should submit form with all required fields', async () => {
    render(<QuoteForm onSubmit={mockOnSubmit} />);

    // Fill required fields
    await user.type(screen.getByLabelText(/pickup zip code/i), '07001');
    await user.selectOptions(screen.getByLabelText(/destination country/i), 'Guyana');
    await user.type(screen.getByDisplayValue('10'), '25'); // Update weight

    // Submit form
    await user.click(screen.getByRole('button', { name: /get quote/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      originZip: '07001',
      destCountry: 'Guyana',
      destCity: '',
      serviceLevel: 'EXPRESS',
      afterHours: false,
      isPersonalEffects: false,
      pieces: [
        {
          type: 'box',
          weight: 25,
          dimensions: undefined, // No dimensions provided
        },
      ],
    });
  });

  it('should handle multiple pieces', async () => {
    render(<QuoteForm onSubmit={mockOnSubmit} />);

    // Add another piece
    await user.click(screen.getByText(/add another piece/i));

    // Fill form fields
    await user.type(screen.getByLabelText(/pickup zip code/i), '07001');
    await user.selectOptions(screen.getByLabelText(/destination country/i), 'Guyana');

    // Update first piece
    const weightInputs = screen.getAllByDisplayValue('10');
    await user.clear(weightInputs[0]);
    await user.type(weightInputs[0], '15');

    // Update second piece
    await user.clear(weightInputs[1]);
    await user.type(weightInputs[1], '20');

    // Change second piece type
    const typeSelects = screen.getAllByDisplayValue('box');
    await user.selectOptions(typeSelects[1], 'barrel');

    await user.click(screen.getByRole('button', { name: /get quote/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      originZip: '07001',
      destCountry: 'Guyana',
      destCity: '',
      serviceLevel: 'EXPRESS',
      afterHours: false,
      isPersonalEffects: false,
      pieces: [
        { type: 'box', weight: 15, dimensions: undefined },
        { type: 'barrel', weight: 20, dimensions: undefined },
      ],
    });
  });

  it('should include dimensions when provided', async () => {
    render(<QuoteForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/pickup zip code/i), '07001');
    await user.selectOptions(screen.getByLabelText(/destination country/i), 'Guyana');

    // Add dimensions
    await user.type(screen.getByLabelText(/length/i), '24');
    await user.type(screen.getByLabelText(/width/i), '18');
    await user.type(screen.getByLabelText(/height/i), '12');

    await user.click(screen.getByRole('button', { name: /get quote/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      originZip: '07001',
      destCountry: 'Guyana',
      destCity: '',
      serviceLevel: 'EXPRESS',
      afterHours: false,
      isPersonalEffects: false,
      pieces: [
        {
          type: 'box',
          weight: 10,
          dimensions: { length: 24, width: 18, height: 12 },
        },
      ],
    });
  });

  it('should handle service level selection', async () => {
    render(<QuoteForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/pickup zip code/i), '07001');
    await user.selectOptions(screen.getByLabelText(/destination country/i), 'Trinidad');

    // Select NFO service
    await user.click(screen.getByLabelText(/next flight out/i));

    await user.click(screen.getByRole('button', { name: /get quote/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceLevel: 'NFO',
        destCountry: 'Trinidad',
      })
    );
  });

  it('should handle after hours option', async () => {
    render(<QuoteForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/pickup zip code/i), '07001');
    await user.selectOptions(screen.getByLabelText(/destination country/i), 'Guyana');

    // Enable after hours
    await user.click(screen.getByLabelText(/after-hours pickup/i));

    await user.click(screen.getByRole('button', { name: /get quote/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        afterHours: true,
      })
    );
  });

  it('should remove pieces correctly', async () => {
    render(<QuoteForm onSubmit={mockOnSubmit} />);

    // Add two additional pieces (total 3)
    await user.click(screen.getByText(/add another piece/i));
    await user.click(screen.getByText(/add another piece/i));

    // Remove the second piece
    const removeButtons = screen.getAllByText('Remove');
    await user.click(removeButtons[1]);

    // Should have 2 pieces now
    expect(screen.getAllByText(/piece \d/i)).toHaveLength(2);
  });

  it('should not allow removing the last piece', async () => {
    render(<QuoteForm onSubmit={mockOnSubmit} />);

    // Should not show remove button when there's only one piece
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });

  it('should show validation errors for invalid input', async () => {
    render(<QuoteForm onSubmit={mockOnSubmit} />);

    // Try to submit without required fields
    await user.click(screen.getByRole('button', { name: /get quote/i }));

    await waitFor(() => {
      expect(screen.getByText(/destination country is required/i)).toBeInTheDocument();
    });

    // Invalid ZIP code
    await user.type(screen.getByLabelText(/pickup zip code/i), 'invalid');
    await user.click(screen.getByRole('button', { name: /get quote/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid zip code/i)).toBeInTheDocument();
    });
  });

  it('should clear validation errors when user fixes input', async () => {
    render(<QuoteForm onSubmit={mockOnSubmit} />);

    // Trigger validation error
    await user.click(screen.getByRole('button', { name: /get quote/i }));
    await waitFor(() => {
      expect(screen.getByText(/destination country is required/i)).toBeInTheDocument();
    });

    // Fix the error
    await user.selectOptions(screen.getByLabelText(/destination country/i), 'Guyana');

    // Error should be cleared
    expect(screen.queryByText(/destination country is required/i)).not.toBeInTheDocument();
  });

  it('should validate piece weights', async () => {
    render(<QuoteForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/pickup zip code/i), '07001');
    await user.selectOptions(screen.getByLabelText(/destination country/i), 'Guyana');

    // Set invalid weight
    const weightInput = screen.getByDisplayValue('10');
    await user.clear(weightInput);
    await user.type(weightInput, '0');

    await user.click(screen.getByRole('button', { name: /get quote/i }));

    await waitFor(() => {
      expect(screen.getByText(/weight must be greater than 0/i)).toBeInTheDocument();
    });
  });

  it('should validate negative dimensions', async () => {
    render(<QuoteForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/pickup zip code/i), '07001');
    await user.selectOptions(screen.getByLabelText(/destination country/i), 'Guyana');

    // Set negative dimension
    await user.type(screen.getByLabelText(/length/i), '-5');

    await user.click(screen.getByRole('button', { name: /get quote/i }));

    await waitFor(() => {
      expect(screen.getByText(/dimensions cannot be negative/i)).toBeInTheDocument();
    });
  });
});
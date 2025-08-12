// tests/quote-form.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import QuoteForm from '../app/components/quote/QuoteForm';

describe('QuoteForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  test('renders form elements', () => {
    render(<QuoteForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText('Pickup ZIP Code (NJ)')).toBeInTheDocument();
    expect(screen.getByLabelText('Destination Country')).toBeInTheDocument();
    expect(screen.getByText('Get Quote')).toBeInTheDocument();
  });

  test('shows validation errors for required fields', () => {
    render(<QuoteForm onSubmit={mockOnSubmit} />);
    
    fireEvent.click(screen.getByText('Get Quote'));
    
    expect(screen.getByText('Destination country is required')).toBeInTheDocument();
  });

  test('validates ZIP code format', () => {
    render(<QuoteForm onSubmit={mockOnSubmit} />);
    
    const zipInput = screen.getByLabelText('Pickup ZIP Code (NJ)');
    fireEvent.change(zipInput, { target: { value: 'invalid' } });
    
    fireEvent.click(screen.getByText('Get Quote'));
    
    expect(screen.getByText('Please enter a valid ZIP code')).toBeInTheDocument();
  });

  test('submits form with valid data', () => {
    render(<QuoteForm onSubmit={mockOnSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Pickup ZIP Code (NJ)'), { target: { value: '07001' } });
    fireEvent.change(screen.getByLabelText('Destination Country'), { target: { value: 'Guyana' } });
    
    fireEvent.click(screen.getByText('Get Quote'));
    
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });
});

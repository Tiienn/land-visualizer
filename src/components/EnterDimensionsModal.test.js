import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EnterDimensionsModal from './EnterDimensionsModal';

// Mock the unit conversions service
jest.mock('../services/unitConversions', () => ({
  getAvailableUnits: jest.fn(() => ['m²', 'ft²', 'hectares', 'acres'])
}));

describe('EnterDimensionsModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onCreateSubdivision: jest.fn(),
    darkMode: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      expect(screen.getByText('Enter Dimensions')).toBeInTheDocument();
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<EnterDimensionsModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Enter Dimensions')).not.toBeInTheDocument();
    });

    it('should render shape selection buttons', () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /rectangle/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /square/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /circle/i })).toBeInTheDocument();
    });

    it('should render default rectangle inputs', () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      expect(screen.getByLabelText(/width \(m\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/height \(m\)/i)).toBeInTheDocument();
    });
  });

  describe('Shape Selection', () => {
    it('should switch to square inputs when square is selected', async () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      await userEvent.click(screen.getByRole('button', { name: /square/i }));
      
      expect(screen.getByLabelText(/side length \(m\)/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/height \(m\)/i)).not.toBeInTheDocument();
    });

    it('should switch to circle inputs when circle is selected', async () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      await userEvent.click(screen.getByRole('button', { name: /circle/i }));
      
      expect(screen.getByLabelText(/radius \(m\)/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/width \(m\)/i)).not.toBeInTheDocument();
    });

    it('should reset dimensions when shape changes', async () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      // Enter some values for rectangle
      await userEvent.type(screen.getByLabelText(/width \(m\)/i), '10');
      await userEvent.type(screen.getByLabelText(/height \(m\)/i), '5');
      
      // Switch to square
      await userEvent.click(screen.getByRole('button', { name: /square/i }));
      
      // Verify dimensions are reset
      expect(screen.getByLabelText(/side length \(m\)/i)).toHaveValue(null);
    });
  });

  describe('Area Calculation', () => {
    it('should calculate area for rectangle', async () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      await userEvent.type(screen.getByLabelText(/width \(m\)/i), '10');
      await userEvent.type(screen.getByLabelText(/height \(m\)/i), '5');
      
      await waitFor(() => {
        expect(screen.getByText('50.00 m²')).toBeInTheDocument();
      });
    });

    it('should calculate area for square', async () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      await userEvent.click(screen.getByRole('button', { name: /square/i }));
      await userEvent.type(screen.getByLabelText(/side length \(m\)/i), '6');
      
      await waitFor(() => {
        expect(screen.getByText('36.00 m²')).toBeInTheDocument();
      });
    });

    it('should calculate area for circle', async () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      await userEvent.click(screen.getByRole('button', { name: /circle/i }));
      await userEvent.type(screen.getByLabelText(/radius \(m\)/i), '2');
      
      await waitFor(() => {
        // π * 2² = approximately 12.57
        expect(screen.getByText('12.57 m²')).toBeInTheDocument();
      });
    });

    it('should handle unit conversions in calculations', async () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      // Change to feet
      await userEvent.selectOptions(screen.getByDisplayValue('m'), 'ft');
      await userEvent.type(screen.getByLabelText(/width \(ft\)/i), '10');
      await userEvent.type(screen.getByLabelText(/height \(ft\)/i), '5');
      
      await waitFor(() => {
        // 10 ft * 5 ft = 50 ft² = 50 * 0.092903 = 4.64515 m²
        expect(screen.getByText('4.65 m²')).toBeInTheDocument();
      });
    });
  });

  describe('Validation', () => {
    it('should show validation errors for invalid dimensions', async () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      await userEvent.type(screen.getByLabelText(/width \(m\)/i), '-5');
      await userEvent.type(screen.getByLabelText(/height \(m\)/i), '0');
      
      await waitFor(() => {
        expect(screen.getByText(/width must be a positive number/i)).toBeInTheDocument();
        expect(screen.getByText(/height must be a positive number/i)).toBeInTheDocument();
      });
    });


    it('should show validation error for dimensions exceeding limit', async () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      await userEvent.type(screen.getByLabelText(/width \(m\)/i), '15000');
      
      await waitFor(() => {
        expect(screen.getByText(/dimensions cannot exceed 10,000 units/i)).toBeInTheDocument();
      });
    });

    it('should disable buttons when validation fails', async () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      await userEvent.type(screen.getByLabelText(/width \(m\)/i), '-5');
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /preview/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /create/i })).toBeDisabled();
      });
    });

    it('should enable buttons when validation passes', async () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      await userEvent.type(screen.getByLabelText(/width \(m\)/i), '10');
      await userEvent.type(screen.getByLabelText(/height \(m\)/i), '5');
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /preview/i })).toBeEnabled();
        expect(screen.getByRole('button', { name: /create/i })).toBeEnabled();
      });
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      await userEvent.click(screen.getByLabelText('Close dialog'));
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Cancel button is clicked', async () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onCreateSubdivision with correct data when Create is clicked', async () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      // Clear and set name field
      const nameInput = screen.getByLabelText(/name/i);
      fireEvent.focus(nameInput);
      fireEvent.select(nameInput);
      await userEvent.type(nameInput, '{selectall}Test Subdivision');
      await userEvent.type(screen.getByLabelText(/width \(m\)/i), '10');
      await userEvent.type(screen.getByLabelText(/height \(m\)/i), '5');
      
      await userEvent.click(screen.getByRole('button', { name: /create/i }));
      
      expect(defaultProps.onCreateSubdivision).toHaveBeenCalledWith({
        shape: 'rectangle',
        dimensions: {
          width: '10',
          height: '5',
          radius: '',
          area: 50,
          linearUnit: 'm',
          areaUnit: 'm²'
        },
        name: 'Test Subdivision',
        area: 50
      });
    });

    it('should reset form state when modal is closed', async () => {
      const { rerender } = render(<EnterDimensionsModal {...defaultProps} />);
      
      // Enter some data
      await userEvent.type(screen.getByLabelText(/width \(m\)/i), '10');
      await userEvent.type(screen.getByLabelText(/height \(m\)/i), '5');
      
      // Close modal
      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      
      // Reopen modal
      rerender(<EnterDimensionsModal {...defaultProps} isOpen={true} />);
      
      // Verify form is reset
      expect(screen.getByLabelText(/width \(m\)/i)).toHaveValue(null);
      expect(screen.getByLabelText(/height \(m\)/i)).toHaveValue(null);
    });
  });

  describe('Dark Mode', () => {
    it('should apply dark mode styles when darkMode is true', () => {
      render(<EnterDimensionsModal {...defaultProps} darkMode={true} />);
      
      const modal = screen.getByText('Enter Dimensions').closest('div').parentElement;
      expect(modal).toHaveClass('bg-gray-800');
      expect(modal).toHaveClass('text-white');
    });

    it('should apply light mode styles when darkMode is false', () => {
      render(<EnterDimensionsModal {...defaultProps} darkMode={false} />);
      
      const modal = screen.getByText('Enter Dimensions').closest('div').parentElement;
      expect(modal).toHaveClass('bg-white');
      expect(modal).toHaveClass('text-gray-900');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/width \(m\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/height \(m\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      // Check that we can tab through interactive elements
      const closeButton = screen.getByLabelText('Close dialog');
      expect(document.body).toHaveFocus(); // Initially no element has focus
      
      // Tab to close button first
      await userEvent.tab();
      expect(closeButton).toHaveFocus();
      
      // Continue tabbing
      await userEvent.tab();
      await userEvent.tab();
      // Check that we can reach input elements
      expect(document.activeElement).toBeTruthy();
    });

    it('should close modal on Escape key', async () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid numeric inputs gracefully', async () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      await userEvent.type(screen.getByLabelText(/width \(m\)/i), 'abc');
      await userEvent.type(screen.getByLabelText(/height \(m\)/i), '5');
      
      await waitFor(() => {
        expect(screen.getByText('0 m²')).toBeInTheDocument();
      });
    });

    it('should handle extremely large numbers', async () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      await userEvent.type(screen.getByLabelText(/width \(m\)/i), '999999999');
      
      await waitFor(() => {
        expect(screen.getByText(/dimensions cannot exceed 10,000 units/i)).toBeInTheDocument();
      });
    });

    it('should handle decimal inputs correctly', async () => {
      render(<EnterDimensionsModal {...defaultProps} />);
      
      await userEvent.type(screen.getByLabelText(/width \(m\)/i), '10.5');
      await userEvent.type(screen.getByLabelText(/height \(m\)/i), '5.25');
      
      await waitFor(() => {
        expect(screen.getByText('55.13 m²')).toBeInTheDocument();
      });
    });
  });
});
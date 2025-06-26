import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TextInput from './TextInput';

describe('TextInput component', () => {
    const defaultProps = {
        id: 'test-input',
        type: 'text',
        label: 'Test Label',
        placeholder: 'Enter text',
        value: '',
        onChange: jest.fn(),
        required: true,
    };

    test('renders correctly with empty props (minimal setup)', () => {
        render(<TextInput />);

        const input = screen.getByRole('textbox');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('type', 'text');
        expect(input).not.toHaveAttribute('placeholder');
        fireEvent.change(input, { target: { value: 'new value' } });
    });

    test('renders with label and placeholder', () => {
        render(<TextInput {...defaultProps} />);

        const input = screen.getByPlaceholderText('Enter text');
        const label = screen.getByText('Test Label');

        expect(input).toBeInTheDocument();
        expect(label).toBeInTheDocument();
        expect(input).toHaveAttribute('type', 'text');
        expect(input).toHaveAttribute('required');
    });

    test('calls onChange with updated value', () => {
        const handleChange = jest.fn();
        render(<TextInput {...defaultProps} onChange={handleChange} />);

        const input = screen.getByPlaceholderText('Enter text');
        fireEvent.change(input, { target: { value: 'new value' } });

        expect(handleChange).toHaveBeenCalledWith('new value');
    });

    test('applies custom className', () => {
        render(<TextInput {...defaultProps} className="custom-class" />);

        const input = screen.getByPlaceholderText('Enter text');
        expect(input).toHaveClass('form-control');
        expect(input).toHaveClass('custom-class');
    });

    test('supports forwarded ref', () => {
        const ref = React.createRef();
        render(<TextInput {...defaultProps} ref={ref} />);

        expect(ref.current).toBeInstanceOf(HTMLInputElement);
        expect(ref.current?.id).toBe('test-input');
    });
});

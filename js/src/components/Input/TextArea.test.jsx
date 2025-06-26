import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TextArea from './TextArea';

describe('TextArea component', () => {
    const defaultProps = {
        id: 'test-input',
        placeholder: 'Enter text',
        label: 'Test Label',
        value: 'Test value',
        onChange: jest.fn(),
        required: true,
    };

    test('renders correctly with empty props (minimal setup)', () => {
        render(<TextArea />);

        const input = screen.getByRole('textbox');
        expect(input).toBeInTheDocument();
        expect(input).not.toHaveAttribute('label');
        expect(input).not.toHaveAttribute('placeholder');
        expect(input).not.toHaveAttribute('required')
        fireEvent.change(input, { target: { value: 'new value' } });
    });

    test('renders textarea with label and placeholder', () => {
        render(<TextArea {...defaultProps} />);

        const textarea = screen.getByRole('textbox');
        expect(textarea).toBeInTheDocument();
        expect(textarea).toHaveAttribute('id', 'test-input');
        expect(textarea).toHaveAttribute('required');
        expect(textarea).toHaveValue('Test value');

        const label = screen.getByText('Test Label');
        expect(label).toBeInTheDocument();
        expect(label).toHaveAttribute('for', 'test-input');
    });

    test('calls onChange when typing', () => {
        const handleChange = jest.fn();
        render(<TextArea {...defaultProps} onChange={handleChange} />);

        const textarea = screen.getByRole('textbox');
        fireEvent.change(textarea, { target: { value: 'new value' } });

        expect(handleChange).toHaveBeenCalledWith('new value');
    });

    test('applies additional className', () => {
        render(<TextArea {...defaultProps} className="custom-class" />);
        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveClass('form-control');
        expect(textarea).toHaveClass('custom-class');
    });

    test('forwards ref correctly', () => {
        const ref = React.createRef();
        render(<TextArea {...defaultProps} ref={ref} />);
        expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
        expect(ref.current?.id).toBe('test-input');
    });
})
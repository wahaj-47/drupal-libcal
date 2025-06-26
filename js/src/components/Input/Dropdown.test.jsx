import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Dropdown from './Dropdown';

describe('Dropdown component', () => {
    const defaultProps = {
        id: 'dropdown-id',
        label: 'Choose an option',
        value: '2',
        onChange: jest.fn(),
        required: true,
    };

    const options = [
        <option key="select" value="">Select</option>,
        <option key="1" value="1">One</option>,
        <option key="2" value="2">Two</option>,
        <option key="3" value="3">Three</option>
    ];

    test('renders dropdown with label and selected value', () => {
        render(<Dropdown {...defaultProps}>{options}</Dropdown>);

        const select = screen.getByRole('combobox');
        const label = screen.getByText('Choose an option');

        expect(select).toBeInTheDocument();
        expect(label).toBeInTheDocument();
        expect(select).toHaveAttribute('id', 'dropdown-id');
        expect(select).toHaveValue('2');
        expect(select).toBeRequired();
    });

    test('renders all children (options)', () => {
        render(<Dropdown {...defaultProps}>{options}</Dropdown>);

        const select = screen.getByRole('combobox');
        expect(select.children.length).toBe(options.length);
    });

    test('calls onChange when value changes', () => {
        const handleChange = jest.fn();
        render(<Dropdown {...defaultProps} onChange={handleChange}>{options}</Dropdown>);

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '3' } });

        expect(handleChange).toHaveBeenCalledWith('3');
    });

    test('applies additional className', () => {
        render(<Dropdown {...defaultProps} className="custom-dropdown">{options}</Dropdown>);
        const wrapper = screen.getByRole('combobox').parentElement;
        expect(wrapper).toHaveClass('form-floating');
        expect(wrapper).toHaveClass('custom-dropdown');
    });

    test('forwards ref correctly', () => {
        const ref = React.createRef();
        render(<Dropdown {...defaultProps} ref={ref}>{options}</Dropdown>);
        expect(ref.current).toBeInstanceOf(HTMLSelectElement);
        expect(ref.current?.id).toBe('dropdown-id');
    });

    test('renders with no children (no options)', () => {
        render(<Dropdown {...defaultProps}></Dropdown>);
        const select = screen.getByRole('combobox');
        expect(select.children.length).toBe(0);
    });

    test('renders with no label', () => {
        render(<Dropdown {...defaultProps} label={undefined}>{options}</Dropdown>);
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.queryByText(defaultProps.label)).not.toBeInTheDocument();
    });

    test('renders with minimal props', () => {
        render(<Dropdown id="minimal">{options}</Dropdown>);
        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
        expect(select).toHaveAttribute('id', 'minimal');
        fireEvent.change(select, { target: { value: '3' } });
    });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Day from './Day';
import dayjs from 'dayjs';

describe('Day component', () => {
    const mockDate = dayjs('2025-06-24');

    test('renders the day number', () => {
        render(<Day date={mockDate} />);
        expect(screen.getByText('24')).toBeInTheDocument();
    });

    test('applies selected-day class when selected is true', () => {
        render(<Day date={mockDate} selected />);
        const day = screen.getByRole('button');
        expect(day).toHaveClass('selected-day');
    });

    test('applies disabled class when disabled is true', () => {
        render(<Day date={mockDate} disabled />);
        const day = screen.getByRole('button');
        expect(day).toHaveClass('disabled');
    });

    test('combines custom className with defaults', () => {
        render(<Day date={mockDate} className="custom-class" />);
        const day = screen.getByRole('button');
        expect(day).toHaveClass('day', 'w-100', 'h-100', 'custom-class');
    });

    test('calls handleClick when clicked', () => {
        const handleClick = jest.fn();
        render(<Day date={mockDate} handleClick={handleClick} />);
        const day = screen.getByRole('button');
        fireEvent.click(day);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('does not crash without optional props', () => {
        render(<Day date={mockDate} />);
        const day = screen.getByRole('button');
        expect(day).toBeInTheDocument();
    });

    test('renders with single-digit date correctly', () => {
        const singleDigitDate = dayjs('2025-06-01');
        render(<Day date={singleDigitDate} />);
        expect(screen.getByText('01')).toBeInTheDocument();
    });

    test('renders visually disabled but remains clickable', () => {
        const handleClick = jest.fn();
        render(<Day date={mockDate} disabled handleClick={handleClick} />);
        const day = screen.getByRole('button');
        expect(day).toHaveClass('disabled');
        fireEvent.click(day);
        expect(handleClick).toHaveBeenCalled();
    });
});

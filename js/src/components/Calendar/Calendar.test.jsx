import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Calendar from './Calendar';
import dayjs from 'dayjs';

jest.mock('react-slick', () => {
    return ({ children }) => <div data-testid="slider-mock">{children}</div>;
});

describe('Calendar Component', () => {
    const today = dayjs();

    test('renders calendar with header and week days', () => {
        render(<Calendar />);

        const monthHeader = screen.getByText(today.format('MMM YYYY'));
        expect(monthHeader).toBeInTheDocument();

        const weekHeaders = screen.getAllByText(/Sun|Mon|Tue|Wed|Thu|Fri|Sat/);
        expect(weekHeaders).toHaveLength(7);
    });

    test('renders valid days in calendar', () => {
        render(<Calendar />);
        const dayCells = screen.getAllByRole('button');
        expect(dayCells.length).toBeGreaterThan(0);
    });

    test('selects a date when clicked', () => {
        const handleDateSelected = jest.fn();
        render(<Calendar onDateSelected={handleDateSelected} />);

        const buttons = screen.getAllByRole('button');
        const days = buttons.filter(el => el.className.includes('day') && !el.className.includes('disabled'))
        fireEvent.click(days[0]);

        expect(handleDateSelected).toHaveBeenCalledTimes(1);
    });

    test('renders entire months for given range', () => {
        const numMonths = 6;
        const dates = {
            start: today,
            end: today.add(numMonths, 'month'),
        }
        render(<Calendar dates={dates} />)

        const buttons = screen.getAllByRole('button');
        const days = buttons.filter(el => el.className.includes('day') && !el.className.includes('invalid'))
        let expectedDays = 0;
        for (let i = 0; i <= numMonths; i++) {
            expectedDays += today.add(i, 'month').daysInMonth();
        }

        expect(days.length).toBe(expectedDays, 'days');
    })

    test('renders disabled days outside the enabled range', () => {
        const customEnabled = {
            start: today.add(10, 'days'),
            end: today.add(20, 'days')
        };
        render(<Calendar enabled={customEnabled} />);

        const buttons = screen.getAllByRole('button');
        const disabledCount = buttons.filter(
            (el) => el.className.includes('disabled')
        ).length;

        expect(disabledCount).toBeGreaterThan(0);
    });

    test('does not call onDateSelected when disabled day is clicked', () => {
        const customEnabled = {
            start: today.add(10, 'days'),
            end: today.add(20, 'days')
        };
        const handleDateSelected = jest.fn();
        render(
            <Calendar enabled={customEnabled} onDateSelected={handleDateSelected} />
        );

        const buttons = screen.getAllByRole('button');
        const disabled = buttons.find((btn) => btn.className.includes('disabled'));

        if (disabled) {
            fireEvent.click(disabled);
            expect(handleDateSelected).not.toHaveBeenCalled();
        }
    });

    test('renders empty div for invalid days', () => {
        render(<Calendar />);
        const blanks = screen.getAllByText('', { selector: '.invalid' });
        expect(blanks.length).toBeGreaterThan(0);
    });
});

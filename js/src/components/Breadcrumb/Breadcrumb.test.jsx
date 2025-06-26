import React from 'react'
import { render, screen } from "@testing-library/react"
import Breadcrumb from "./Breadcrumb"

describe('Breadcrumb component', () => {
    const crumbs = [
        { label: "Home", link: "/" },
        { label: "Library", link: "/library" },
        { label: "Books", link: "/library/books" },
    ]

    test('renders all crumbs', () => {
        render(<Breadcrumb crumbs={crumbs}></Breadcrumb>);
        crumbs.forEach(({ label }) => {
            expect(screen.getByText(label)).toBeInTheDocument();
        })
    })

    test('renders all but the last crumb without .end class', () => {
        const { container } = render(<Breadcrumb crumbs={crumbs} />);
        const breadcrumbDivs = container.querySelectorAll('.breadcrumb');

        expect(breadcrumbDivs.length).toBe(crumbs.length);
        breadcrumbDivs.forEach((div, index) => {
            if (index < crumbs.length - 1) {
                expect(div.classList.contains('end')).toBe(false);
                const link = div.querySelector('a');
                expect(link).not.toHaveClass('current-crumb');
            } else {
                expect(div.classList.contains('end')).toBe(true);
                const link = div.querySelector('a');
                expect(link).toHaveClass('current-crumb');
            }
        });
    });

    test('uses the correct href attributes', () => {
        render(<Breadcrumb crumbs={crumbs} />);
        crumbs.forEach(({ label, link }) => {
            const anchor = screen.getByText(label);
            expect(anchor.getAttribute('href')).toBe(link);
        });
    });

    test('renders correctly with one crumb', () => {
        const oneCrumb = [{ label: 'Home', link: '/' }];
        const { container } = render(<Breadcrumb crumbs={oneCrumb} />);
        const div = container.querySelector('.breadcrumb');
        const link = screen.getByText('Home');

        expect(div).toHaveClass('end');
        expect(link).toHaveClass('current-crumb');
        expect(link).toHaveAttribute('href', '/');
    });

    test('renders nothing with empty crumbs array', () => {
        const { container } = render(<Breadcrumb crumbs={[]} />);
        expect(container.firstChild).toBeNull();
    });

    test('renders nothing with null or undefined crumbs', () => {
        const { container: nullContainer } = render(<Breadcrumb crumbs={null} />);
        const { container: undefinedContainer } = render(<Breadcrumb />);
        expect(nullContainer.firstChild).toBeNull();
        expect(undefinedContainer.firstChild).toBeNull();
    });
})
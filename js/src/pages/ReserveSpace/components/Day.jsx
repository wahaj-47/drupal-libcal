import React from 'react'
import classNames from 'classnames'

const Day = ({ date, selected, disabled }) => {
    const containerClass = classNames({
        'calDay': true,
        'indicator': true,
        'selected': selected
    })

    const contentClass = classNames({
        'dayContainer': true,
        'available': !disabled
    })

    return (
        <button
            disabled={disabled}
            className={containerClass}
        >
            <div className={contentClass}>
                <span class="numDay">{date.format("D")}</span>
                <span class="monthDay">{date.format("MMM")}</span>
            </div>
        </button>
    );
}

export default Day
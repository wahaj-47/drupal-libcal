import React from 'react'
import classNames from 'classnames'

const Day = ({ date, selected, disabled, className, handleClick }) => {
    const dayClass = classNames('day w-100 h-100', {
        'selected': selected,
        'disabled': disabled
    }, className)

    return (
        <div
            role="button"
            className={dayClass}
            onClick={handleClick}
        >
            <span className="day-num">{date.format("D")}</span>
            <span className="day-month">{date.format("MMM")}</span>
        </div>
    );
}

export default Day
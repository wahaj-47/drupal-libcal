import React from 'react'
import classNames from "classnames";

const Day = ({ date, selected, disabled, className, handleClick }) => {
    const dayClass = classNames('day w-100 h-100', {
        'selected': selected,
        'disabled': disabled
    }, className);

    return (
        <div
            role="button"
            className={dayClass}
            onClick={handleClick}
        >
            <h1>{date.format("DD")}</h1>
        </div>
    )
}

export default Day
import React from 'react'
import classNames from 'classnames'

const Slot = ({ id, label, selected, isValid, handleSelect }) => {
    const slotClass = classNames({
        'slot': true,
        'slot-selected': selected,
        'disabled': !isValid
    })

    return (
        <button
            disabled={!isValid}
            className={slotClass}
            onClick={handleSelect(id)}
        >
            <span class="slot-time">
                {label}
            </span>
        </button>
    )
}

export default Slot
import React, { forwardRef } from 'react'
import classNames from 'classnames'

const Dropdown = forwardRef(({ id, className, label, value, onChange, required, children }, ref) => {
    const containerClass = classNames('form-floating', className)

    return (
        <div className={containerClass}>
            <select className='form-select' id={id} aria-label={label} value={value} onChange={(e) => { onChange?.(e.target.value) }} required={required} ref={ref}>
                {children}
            </select>
            <label htmlFor={id}>{label}</label>
        </div>
    )
})

export default Dropdown;

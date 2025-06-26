import React, { forwardRef } from 'react'
import classNames from 'classnames'

const Checkbox = forwardRef(({ id, className, label, labelClassName, value, checked, onChange, required, inline }, ref) => {
    const containerClass = classNames('form-check', { 'form-check-inline': inline })
    const checkboxClass = classNames('form-check-input', className)
    const labelClass = classNames('form-check-label', labelClassName)

    return (
        <div className={containerClass}>
            <input id={id} type="checkbox" className={checkboxClass} value={value} checked={checked} onChange={(e) => { onChange?.(e.target.value) }} ref={ref} required={required}></input>
            <label htmlFor={id} className={labelClass}>{label}</label>
        </div>
    )
})

export default Checkbox

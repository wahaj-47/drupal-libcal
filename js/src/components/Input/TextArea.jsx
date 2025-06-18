import React, { forwardRef } from 'react'
import classNames from 'classnames'

const TextArea = forwardRef(({ id, placeholder, className, label, value, onChange, required }, ref) => {
    const inputClass = classNames('form-control', className)

    return (
        <div className="form-floating">
            <textarea
                ref={ref}
                id={id} className={inputClass} placeholder={placeholder} value={value} onChange={(e) => { onChange(e.target.value) }} required={required}
                style={{ minHeight: 120 + "px" }}>
            </textarea>
            <label for={id} className="form-label">{label}</label>
        </div >
    )
})

export default TextArea
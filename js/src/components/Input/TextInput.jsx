import React, { forwardRef } from "react";
import classNames from "classnames";

const TextInput = forwardRef(({ id, type, placeholder, className, label, value, onChange, required }, ref) => {
    const inputClass = classNames('form-control', className)

    return (
        <div className="form-floating">
            <input ref={ref} id={id} type={type} className={inputClass} placeholder={placeholder} value={value} onChange={(e) => { onChange(e.target.value) }} required={required}></input>
            <label for={id} className="form-label">{label}</label>
        </div>
    )
})

export default TextInput
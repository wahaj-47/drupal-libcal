import React, { useCallback, useMemo, useRef, useState } from 'react'

import { motion } from "framer-motion";

import TextInput from '../../../components/Input/TextInput';
import Dropdown from "../../../components/Input/Dropdown";
import Checkbox from "../../../components/Input/Checkbox";
import Radio from "../../../components/Input/Radio";

const ReservationForm = ({ form, handleSubmit }) => {

    const defaultFields = useMemo(() => ({
        fname: { label: "First Name", type: 'string', required: true },
        lname: { label: "Last Name", type: 'string', required: true },
        email: { label: "Email", type: 'string', required: true }
    }), [])

    const fields = form ? form.fields : defaultFields;
    const [formState, setFormState] = useState(
        Object.fromEntries(
            Object.entries(fields).map(([key, field]) => getDefaultValue(key, field))
        )
    )
    const [errors, setErrors] = useState(
        Object.fromEntries(
            Object.keys(fields).map(field => [field, ""])
        )
    )
    const inputRefs = useRef(null);
    const getInputMap = () => {
        if (!inputRefs.current) {
            inputRefs.current = new Map();
        }
        return inputRefs.current;
    }

    const setFormValue = (field) => (value) => {
        setFormState(prevFormState => ({ ...prevFormState, [field]: value }))
    }

    const onSubmit = (e) => {
        e.preventDefault();
        console.log("Outside", isFormValid())
        if (isFormValid()) {
            console.log("Inside", isFormValid())
            handleSubmit(formState);
        }
    }

    const isFormValid = () => {
        setErrors(
            Object.fromEntries(
                Object.keys(fields).map(field => [field, ""])
            )
        )

        try {
            for (const [key, field] of Object.entries(fields)) {
                if (key === 'email' && !isValidEmail(formState[key])) {
                    throw { key, message: "Please use your LSU email" };
                }

                if (field.type === 'checkbox' && field.required && _.isEmpty(formState[key])) {
                    throw { key, message: "Please select at least one of these options" };
                }
            }
        } catch (e) {
            error(e.key, e.message);
            return false;
        }

        return true;
    }

    const focus = (key) => {
        const inputMap = getInputMap();
        const node = inputMap.get(key)
        node.focus();
    }

    const error = (key, msg) => {
        setErrors(prevErrors => ({ ...prevErrors, [key]: msg }))
        focus(`${key}`)
    }

    const isValidEmail = useCallback((email) => {
        const regex = new RegExp("[a-z0-9\.-_]*@lsu\.edu$", "i");
        return regex.test(email)
    }, [])

    const refCallback = useCallback((key) => (node) => {
        const inputMap = getInputMap();
        inputMap.set(key, node);
        return () => {
            inputMap.delete(key);
        }
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, translateY: 200 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -200 }}
            layout
        >
            <form onSubmit={onSubmit}>
                {Object.entries(fields).map(([key, field]) =>
                    <div key={key} class="row g-2 m-1">
                        {field.type === "string" &&
                            <TextInput
                                type="text"
                                id={key}
                                label={field.label}
                                placeholder={field.label}
                                required={field.required}
                                value={formState[key]}
                                onChange={setFormValue(key)}
                                ref={refCallback(key)}
                            >
                            </TextInput>
                        }
                        {
                            field.type === "dropdown" &&
                            <Dropdown
                                id={field.id}
                                label={field.label}
                                required={field.required}
                                value={formState[key]}
                                onChange={setFormValue(key)}
                                ref={refCallback(key)}
                            >
                                <option value="">Select an option</option>
                                {field.options.map((option) => <option value={option}>{option}</option>)}
                            </Dropdown>
                        }
                        {
                            field.type === "checkbox" &&
                            <div className='p-1 m-0'>
                                <fieldset className='border rounded p-2' ref={refCallback(key)}>
                                    <legend className='fs-6'>{field.label}</legend>
                                    {field.options.map((option) =>
                                        <Checkbox
                                            key={`${field.type}-${option}`}
                                            id={`${field.type}-${option}`}
                                            label={option}
                                            value={option}
                                            checked={formState[key].includes(option)}
                                            onChange={(checked) => { setFormValue(key)(_.xor(formState[key], [option])) }}
                                            inline
                                        >
                                        </Checkbox>)}
                                </fieldset>
                            </div>
                        }
                        {
                            field.type === 'radio' &&
                            <div className='p-1 m-0'>
                                <fieldset className='border rounded p-2' ref={refCallback(key)}>
                                    <legend className='fs-6'>{field.label}</legend>
                                    {field.options.map((option) =>
                                        <Radio
                                            key={`${field.type}-${option}`}
                                            id={`${field.type}-${option}`}
                                            name={key}
                                            label={option}
                                            required={field.required}
                                            value={option}
                                            checked={formState[key] === option}
                                            onChange={setFormValue(key)}
                                            inline
                                        >
                                        </Radio>)}
                                </fieldset>
                            </div>
                        }
                        {errors[key] && <p className="error">{errors[key]}</p>}
                    </div>
                )}
                <div className="d-flex">
                    <button
                        className="ms-auto btn btn-outline-primary px-4"
                        type="submit"
                    >
                        Submit <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </form>
        </motion.div >
    )
}

const getDefaultValue = (key, field) => {
    switch (field.type) {
        case 'checkbox':
            return [key, []]
        default:
            return [key, ""]
    }
}

export default ReservationForm
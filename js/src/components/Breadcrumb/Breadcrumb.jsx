import React from "react";

const Breadcrumb = ({ crumbs }) => {
    return (
        crumbs?.map(({ label, link }, index, arr) => {
            if (index < arr.length - 1)
                return (<div key={index} className="breadcrumb"><a href={link}>{label}</a></div>)

            return (<div key={index} className="breadcrumb end"><a className="current-crumb" href={link}>{label}</a></div>)
        })
    )
}

export default Breadcrumb
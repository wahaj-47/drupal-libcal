import React from "react";

const Breadcrumb = ({ crumbs }) => {
    return (
        crumbs.map(({ label, link }, index, arr) => {
            if (index < arr.length - 1)
                return (<div class="breadcrumb"><a href={link}>{label}</a></div>)

            return (<div class="breadcrumb end"><a className="current-crumb" href={link}>{label}</a></div>)
        })
    )
}

export default Breadcrumb
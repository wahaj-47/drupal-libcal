import React from "react";

const Breadcrumb = ({ crumbs }) => {
    return (
        crumbs.map(({ label, link }, index, arr) => {
            if (index < arr.length - 1)
                return (<><a href={link}>{label}</a> <i class="fas fa-chevron-right"></i> </>)

            return (<a className="current-crumb" href={link}>{label}</a>)
        })
    )
}

export default Breadcrumb
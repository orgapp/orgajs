import React from "react"

export default props => <pre>{JSON.stringify(props.pageContext, null, 2)}</pre>

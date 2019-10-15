import React from "react"

export default props => <pre>{JSON.stringify(props.post, null, 2)}</pre>

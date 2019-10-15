import React from "react"

export default props => <pre>{JSON.stringify(props.posts, null, 2)}</pre>

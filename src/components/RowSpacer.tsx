import React from 'react'

const RowSpacer = (props : {
  height: number,
  className?: string | null,
}) => {
  return (
    <div className={"row p-0 " + (props.className ?? "") } style={{
      height: props.height,
    }}></div>
  )
}

export default RowSpacer

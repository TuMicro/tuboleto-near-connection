import React from 'react'

const bgString = 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(182,146,246,1) 22%, rgba(133,78,232,1) 41%, rgba(96,32,210,1) 100%)';

const Rectangle = (props : {
  width: number,
  height: number,
} | {
  oneDim: number,
} | {
  fluid: true,
  height: number,
}
) => {
  if ('fluid' in props) {
    return (
      <div style={{
        width: '100%',
        height: props.height,
        background: bgString,
      }}>
        
      </div>
    );
  }
  if ('oneDim' in props) {
    return (
      <div style={{
        width: props.oneDim,
        height: props.oneDim,
        background: bgString,
      }}>
        
      </div>
    )
  }
  return (
    <div style={{
      width: props.width,
      height: props.height,
      background: bgString,
    }}>
      
    </div>
  )
}

export default Rectangle

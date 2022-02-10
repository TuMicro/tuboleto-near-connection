// created using rcep shortcut
import { Component } from 'react'

interface IProps {
}

interface IState {
  trLoading: boolean,
}

export class Main extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      trLoading: false,
    };
  }

  componentDidMount() {
    // initializations on mount
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={"https://static.wixstatic.com/media/b75418_3675dc741fce4c85a6264579958ee039~mv2.png/v1/fill/w_298,h_108,al_c,q_85,usm_0.66_1.00_0.01/logo-tu-boleto-pago-sin-contacto-peru_pn.webp"} 
          style={{
            width: 149,
            height: 54,
          }}
          className="App-logo" alt="logo" />
          <br/>
          <br/>
          {
            (
                this.state.trLoading ? 
                  "Cargando... ✌️" : 
                  <>
                    {/* {conectionDependantContent} */}
                    <br/>
                    {/* <button onClick={() => this.openTuBoleto(amountStr)}>Abrir TuBoleto</button>
                    <br/> */}
                  </>
            )
          }
          <p style={{
            fontSize: '8px',
          }}>TuBoleto - Near connector v0.0.1</p>
        </header>
      </div>
    )
  }
}

export default Main
// created using rcep shortcut
import { Component } from 'react'
import * as nearAPI from "near-api-js"
import { nearMainnetConfig } from '../util/blockchains/NearConstants';

interface IProps {
}

interface IState {
  trLoading: boolean,
  near?: nearAPI.Near;
  walletConnection?: nearAPI.WalletConnection;
}

export class Main extends Component<IProps, IState> {
  walletAccount?: nearAPI.WalletConnection;
  accountId = "";

  constructor(props: IProps) {
    super(props);
    this.state = {
      trLoading: false,
    };
  }

  initNearBlockchainConnection = async () => {
    // Initializing connection to the NEAR node.
    if (this.state.near == null || this.state.walletConnection == null) {
      const near = await nearAPI.connect(nearMainnetConfig);
      // create wallet connection
      const wallet = new nearAPI.WalletConnection(near, 'TuBoleto');
      this.setState({ near, walletConnection: wallet });
      return {
        near,
        walletConnection: wallet,
      };
    }
    return {
      near: this.state.near,
      walletConnection: this.state.walletConnection,
    };
  }

  sendNear = async (amountStr: string) => {

  }

  connect = async (walletConnection: nearAPI.WalletConnection) => {
    walletConnection.requestSignIn(undefined, 'TuBoleto');
  }

  async componentDidMount() {
    // init near blockchain connection:
    const { walletConnection } = await this.initNearBlockchainConnection();

    // alert(wallet.isSignedIn());
    if (!walletConnection.isSignedIn()) {
      this.connect(walletConnection);
    } else {
      // TODO: ask for signature and store it
      // TODO: store wallet on backend
      // TODO: trigger transference
    }
  }

  disconnect = async () => {
    this.state.walletConnection?.signOut();
  }


  getAmountFromQueryParams = () => {
    let params = (new URL(document.location.toString())).searchParams;
    let amount = params.get("amount") ?? "0.001";
    // let ts = params.get("ts") ?? "0.001";
    return amount;
  }

  render() {

    let conectionDependantContent;

    const amountStr = this.getAmountFromQueryParams();

    if (this.state.walletConnection != null) {
      if (this.state.walletConnection.isSignedIn()) {
        conectionDependantContent = (
          <>
            <div>
              <button onClick={() => this.sendNear(amountStr)}>Reintentar el envío de {amountStr} NEAR</button>
            </div>
            <p>
              <span style={{
                fontSize: '14px',
              }}>🟢 Billetera conectada</span>
              <br />
              <span style={{
                fontSize: '12px',
              }}>{this.state.walletConnection.getAccountId()}</span>
            </p>


            <button onClick={() => this.disconnect()}>Desconectar</button>
          </>
        )
      } else {
        conectionDependantContent = (<div>
          <button onClick={() => this.connect(this.state.walletConnection!)}>Conectar Billetera</button>
        </div>)
      }
    } else {
      conectionDependantContent = <></>;
    }

    return (
      <div className="App">
        <header className="App-header">
          <img src={"https://static.wixstatic.com/media/b75418_3675dc741fce4c85a6264579958ee039~mv2.png/v1/fill/w_298,h_108,al_c,q_85,usm_0.66_1.00_0.01/logo-tu-boleto-pago-sin-contacto-peru_pn.webp"}
            style={{
              width: 149,
              height: 54,
            }}
            className="App-logo" alt="logo" />
        </header>
        <div className='container'>
          <br />
          <br />
          {
            (
              this.state.trLoading || this.state.walletConnection == null ?
                "Cargando... ✌️" :
                <>
                  {conectionDependantContent}
                  <br />
                  {/* <button onClick={() => this.openTuBoleto(amountStr)}>Abrir TuBoleto</button>
                    <br/> */}
                </>
            )
          }
          <p style={{
            fontSize: '8px',
          }}>TuBoleto - Near connector v0.0.1</p>
        </div>
      </div>
    )
  }
}

export default Main
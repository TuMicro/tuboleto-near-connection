// created using rcep shortcut
import { Component } from 'react'
import * as nearAPI from "near-api-js"
import { nearMainnetConfig } from '../util/blockchains/NearConstants';
import { requestPing } from '../api/PdUsuario';
import { parseUnits } from "ethers/lib/utils";
import { isProductionWebsite } from '../util/DevEnvUtil';
import { isMobile } from '../util/DetectMobile';

const PAST_HASHES = "PAST_HASHES";
const TUBOLETO_URI = "tuboleto:";
// const TUBOLETO_URI = "https://tuboleto.pe/app";

interface IProps {
}

interface IState {
  trLoading: boolean;
  
  near?: nearAPI.Near;
  walletConnection?: nearAPI.WalletConnection;
  pingResponse?: any;
}

export class Main extends Component<IProps, IState> {

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
    this.setState({ trLoading: true });
    const yoctoNEAR = parseUnits(amountStr, 24);
    const result = await this.state.walletConnection?.account().sendMoney(
      "tuboleto.near", // receiver account
      yoctoNEAR.toString(), // amount in yoctoNEAR
    );
    console.log(result);
    this.setState({ trLoading: false });
  }

  connect = async (walletConnection: nearAPI.WalletConnection) => {
    walletConnection.requestSignIn(undefined, 'TuBoleto');
  }

  async componentDidMount() {
    // init near blockchain connection:
    const { walletConnection } = await this.initNearBlockchainConnection();

    if (!walletConnection.isSignedIn()) {
      this.connect(walletConnection);
    } else { // wallet is connected
      // TODO: ask for signature from the wallet and store it on the backend
      const { amount: amountStr, userId, penCents, transactionHashes, errorMessage } = this.getDataFromQueryParams();
      if (transactionHashes === "") { // no transaction hashes
        if (errorMessage === "") { // no error message, so we haven't tried yet
          this.sendNear(amountStr);
        } // otherwise we already tried and failed, just show the error message
      } else {
        const str = window.localStorage.getItem(PAST_HASHES) ?? "[]";
        const oldHashes = JSON.parse(str) as string[];
        if (oldHashes.includes(transactionHashes)) {
          ;
        } else {
          // ping backend to start the validation process
          this.setState({ trLoading: true });
          const res = await requestPing({
            uid: userId,
            penCents: penCents,
          });
          this.setState({ trLoading: false, pingResponse: res });
          console.log(res);
          if (res.msg === "OK") {
            oldHashes.push(transactionHashes);
            window.localStorage.setItem(PAST_HASHES, JSON.stringify(oldHashes));
            if (isMobile()) {
              this.openTuBoleto();
            }
          } else {
            alert(res.msg);
          }
        }
      }
    }
  }

  disconnect = async () => {
    this.state.walletConnection?.signOut();
  }


  getDataFromQueryParams = () => {
    let params = (new URL(document.location.toString())).searchParams;
    let amount = params.get("amount") ?? "0.001"; // in NEAR
    let userId = params.get("userId") ?? "";
    let penCents = params.get("penCents") ?? "";
    let errorMessage = params.get("errorMessage") ?? "";
    let transactionHashes = params.get("transactionHashes") ?? "";
    return {
      amount,
      userId,
      penCents,
      errorMessage, // from Near wallet
      transactionHashes, // from Near wallet
    };
  }
  openTuBoleto = () => {
    document.location.href = TUBOLETO_URI;
  }

  render() {

    let conectionDependantContent;

    const { amount: amountStr, userId, penCents, errorMessage, transactionHashes } = this.getDataFromQueryParams();

    if (this.state.walletConnection != null) {
      if (this.state.walletConnection.isSignedIn()) {
        if (transactionHashes === "") {
          conectionDependantContent = (
            <>
              <div>
                <button onClick={
                  () => this.sendNear(amountStr)}>🔁 Retry sending {amountStr} NEAR</button>
              </div>
              <p>
                <span style={{
                  fontSize: '14px',
                  color: 'red',
                }}>{decodeURIComponent(errorMessage)}</span>
                <br />
                <span style={{
                  fontSize: '14px',
                }}>🟢 Wallet Connected</span>
                <br />
                <span style={{
                  fontSize: '12px',
                }}>{this.state.walletConnection.getAccountId()}</span>
              </p>


              <button onClick={() => this.disconnect()}>Disconnect</button>
            </>
          )
        } else {
          conectionDependantContent = (<>
            <span style={{
              fontSize: '16px',
            }}>Success!! 🥳</span>
            <br />
            <span style={{
              fontSize: '14px',
            }}>You can go back to TuBoleto now</span>
            <br />
            {isMobile() ?
              // <button onClick={() => this.openTuBoleto()}>Regresar a TuBoleto</button>
              // <a href={TUBOLETO_URI}>Regresar a TuBoleto</a>
              <></>
              : <></>}
            <br />
          </>);
        }
      } else {
        conectionDependantContent = (<div>
          <button onClick={() => this.connect(this.state.walletConnection!)}>Connect Wallet</button>
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
          <>
            {
              !isProductionWebsite ? <button onClick={() => {
                requestPing({
                  uid: userId,
                  penCents: penCents,
                });
              }}>Ping test</button> : <></>
            }
          </>
          {
            (
              this.state.trLoading || this.state.walletConnection == null ?
                "Loading... ✌️" :
                <>
                  {conectionDependantContent}
                  <br />
                </>
            )
          }
          <p style={{
            fontSize: '8px',
          }}>TuBoleto - Near connector v0.0.9</p>
        </div>
      </div>
    )
  }
}

export default Main
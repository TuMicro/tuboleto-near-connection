import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import './App.css';
import { useEffect, useState } from "react";
import { isProductionWebsite } from "./util/DevEnvUtil";
import Main from "./pages/Main";
//import DesktopHeaderMenu01 from "./components/DesktopHeaderMenu01";

export const eraTestPath = "/earthlingrescuealliance";

interface State {
}


function App() {

  const initialState: State = {
  }

  const [state, setState] = useState(initialState);

  // runs when this component loads:
  useEffect(() => {
    // initializations
    if (isProductionWebsite) {
      // smartlookClient.init('');
    }
  }, []);


  return (
    <Router
    // basename="/tunnelJosue" // con esto los assets aún se cargan en el path '/'
    // basename={process.env.PUBLIC_URL}
    >
      <div>
        <Switch>
          <Route path="/">
            <Main></Main>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;

import { useState } from 'react'
import './App.css'
import { useFetch } from './hooks/useFetch'

function App() {
  const apiUrl = 'http://127.0.0.1:5000/api/analyze';
  const [ subCon, setSubCon ] = useState("")
  const [ cost, setCost ] = useState("")
  const { data, loading, error, performFetch, clearData } = useFetch(apiUrl)
  const [ errs, setErrs ] = useState({})

  const handleInput = (e) => {
    const { name, value } = e.target;
    let errMessage = "";

    setErrs({})
 
    if(value === "") {
      errMessage = "";
    } else if (isNaN(value)) {
      errMessage = "Input shall be a number";
    } else if (Number(value <= 0)) {
      errMessage = "Input shall be a positive number";
    }

    setErrs(prevErrs => ({
      ...prevErrs,
      [name]: errMessage
    }));

    if(name === "substrate-concentration") {
      setSubCon(value);
    } else if (name === "cost") {
      setCost(value);
    }
  };

  const handleCalculation = () => {
    const options = {
      body: {
        substrate_concentration: subCon,
        cost: cost
      }
    }

    performFetch(options)
  };

  const handleReset = () => {
    setSubCon("");
    setCost("");
    setErrs({});
    clearData();
  }

  return (
    <div className="container">
      {error && (
        <div className="error-banner"><strong>Error: </strong>{error}</div>
      )}
      <h2>Biotech Efficiency Analyzer</h2>
      <div className="input-group">
        <label htmlFor="sub-con">Substrate Concentration</label>
        <input
          type="text"
          name="substrate-concentration"
          id="sub-con"
          value={subCon}
          onChange={handleInput}
          required
        />
        {errs["substrate-concentration"] && <p className="err">{errs["substrate-concentration"]}</p>}
      </div>
      <div className="input-group">
        <label htmlFor="cost">Cost</label>
        <input type="text" name="cost" id="cost" value={cost} onChange={handleInput} required/>
        {errs["cost"] && <p className="err">{errs["cost"]}</p>}
      </div>
      <button onClick={handleCalculation} disabled={!subCon || !cost}>Calculate</button>
      <button onClick={handleReset} disabled={!subCon || !cost}>Reset</button>

      {data && !loading && <div className="results">
        <h2>Results</h2>
        <p>Velocity: {data && data.velocity}</p>
        <p>Efficiency: {data && data.efficiency}</p>
      </div>}
    </div>
  )
}

export default App

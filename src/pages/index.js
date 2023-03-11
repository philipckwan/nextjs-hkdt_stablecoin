// index.html
import {useState} from 'react';
import {timeLog} from '@/lib/PCKUtils'

const version = "v0.3";

function Header({ title }) {
  return <h1>{title ? title : 'Default title'}</h1>;
}

export default function HomePage() {

  const [message, setMessage] = useState("n/a");

  function handleClick() {
    console.log(`handleClick: 1.0;`);
    timeLog(`handleClick: 2.0;`);
  }

  return (
    <>
    <div>
    <table className="myTable">
      <tbody>
      <tr>
        <td>dApp HKDT</td>
        <td>{version}</td>
      </tr>  
      <tr>
        <td>message</td>
        <td>{message}</td>
      </tr>       
      <tr>
        <td><button onClick={handleClick}>Try Click</button></td>
        <td></td>
      </tr>          
      </tbody>
    </table>
    </div>
    </>
  );
}
import React, { Component } from 'react'
import { Socket } from 'phoenix'
import { Terminal } from 'xterm'
import 'xterm/dist/xterm.css'
import './App.css'
import * as fit from 'xterm/lib/addons/fit/fit';
import * as WebfontLoader from 'xterm-webfont'

Terminal.applyAddon(WebfontLoader)
Terminal.applyAddon(fit);

class App extends Component {
  constructor(){
    super();
    this.handleChange = this.handleChange.bind(this)
    this.runTests = this.runTests.bind(this)
    this.connect = this.connect.bind(this)
    this.terminal = new Terminal()
    this.terminal.on('data', (data) => {
      this.channel.push('terminal_input', {data: btoa(data)})
    })

    this.state = {
      token: localStorage.getItem('token') ,
      labName: localStorage.getItem('labName') || "sandbox",
      server: "localhost",
      username: localStorage.getItem('username'),
      type: "ide",
      output: [],
    }
  }

  serverMap(){
    return {
      "Local": "localhost",
      "Staging 01": "staging-01.ide.learn.co",
      "Staging 02": "staging-02.ide.learn.co",
      "NYC 01": "nyc-01.ide.learn.co",
      "NYC 02": "nyc-02.ide.learn.co",
      "NYC 03": "nyc-03.ide.learn.co",
      "NYC 04": "nyc-04.ide.learn.co",
      "NYC 05": "nyc-05.ide.learn.co",
      "NYC 06": "nyc-06.ide.learn.co",
      "NYC 07": "nyc-07.ide.learn.co",
      "NYC 08": "nyc-08.ide.learn.co",
      "NYC 09": "nyc-09.ide.learn.co",
      "NYC 10": "nyc-10.ide.learn.co",
      "NYC 11": "nyc-11.ide.learn.co",
      "NYC 12": "nyc-12.ide.learn.co",
      "NYC 13": "nyc-13.ide.learn.co",
      "NYC 14": "nyc-14.ide.learn.co",
      "NYC 15": "nyc-15.ide.learn.co",
      "NYC 16": "nyc-16.ide.learn.co",
      "SFO 01": "sfo-01.ide.learn.co",
      "SFO 02": "sfo-02.ide.learn.co",
      "SFO 03": "sfo-03.ide.learn.co",
      "SFO 04": "sfo-04.ide.learn.co",
      "SFO 05": "sfo-05.ide.learn.co",
      "SFO 06": "sfo-06.ide.learn.co",
      "SFO 07": "sfo-07.ide.learn.co",
      "SFO 08": "sfo-08.ide.learn.co",
      "FRA 01": "fra-01.ide.learn.co",
      "FRA 02": "fra-02.ide.learn.co",
      "FRA 03": "fra-03.ide.learn.co",
      "FRA 04": "fra-04.ide.learn.co",
      "FRA 05": "fra-05.ide.learn.co",
      "FRA 06": "fra-06.ide.learn.co",
      "FRA 07": "fra-07.ide.learn.co",
      "FRA 08": "fra-08.ide.learn.co",
    }
  }
  componentDidMount(){
    this.terminal.open(document.getElementById('terminal'));
    this.terminal.fit()
  }

  handleChange({target}){
    localStorage.setItem(target.id, target.value)
    this.setState({[target.id]: target.value})
  }

  runTests(){
    this.channel.push('run_tests')
  }

  connect() {
    this.socket = new Socket(`ws://${this.state.server}:4000/socket`,
      {
        params: { token: this.state.token },
        logger: (kind, msg, data) => {
          console.log(`${kind}: ${msg}`, data)
        }
      }
    )
    this.socket.connect()
    this.channel = this.socket.channel(this.channelName(), {client: 'browser'})
    this.channel.on("status", ({status}) => {
      console.log("status", status)
      this.setState({output: this.state.output.concat([JSON.stringify({status: status})])})
    })
    this.channel.on("debug", ({output, command}) => {
      console.log("Command: ", command)
      console.log("Output: ", atob(output))
      this.setState({output: this.state.output.concat([JSON.stringify({"Command": command})])})
      this.setState({output: this.state.output.concat([JSON.stringify({"Output": atob(output)})])})
    })
    this.channel.on("environment_created", ({url}) => {
      console.log("Environment Created", url)
      this.setState({output: this.state.output.concat([JSON.stringify({"Environment Created": url})])})
    })

    this.channel.on("jupyter_ready", (connection) => {
      console.log("Jupter ready", connection)
      this.setState({output: this.state.output.concat([JSON.stringify({"Jupyter Ready": connection})])})
    })

    this.channel.on("test_output", ({output}) => {
      console.log("Test Output", atob(output))
      this.setState({output: this.state.output.concat([JSON.stringify({"Test Output": atob(output)})])})
    })

    this.channel.on("finished_running_tests", (result) => {
      console.log("tests finished running")
      this.setState({output: this.state.output.concat([JSON.stringify({"Finished Running Tests": result})])})
    })

    this.channel.on("file_system_event", ({file_system_event}) => {
      console.log("File System Event output")
      this.setState({output: this.state.output.concat([JSON.stringify({"File System Event Output": atob(file_system_event)})])})
    })
    this.channel.on("terminal_output", ({terminal_output}) => {
      console.log("Terminal output")
      this.terminal.write(atob(terminal_output))
    })
    this.channel.join()
  }

  channelName() {
    return `${this.state.type}:${this.state.username}:${this.state.labName}`
  }

  render() {
    return (
      <div>
        <h2>
          Phoeyonce Test Client
        </h2>
        <h3>
          This app provides a lightweight client to test the various Phoeyonce environments.
        </h3>
        <div>
          Grab the token from your Learn profile https://learn.co/:github_username
        </div>
        <div className="form-field">
          <label className="form-field__label" htmlFor="token">Learn Token</label>
          <input className="form-field__input" type="text" id="token" value={this.state.token} onChange={this.handleChange}/>
        </div>
        <div className="form-field">
          <label className="form-field__label" htmlFor="labName">Lab Name</label>
          <input className="form-field__input" type="text" id="labName" value={this.state.labName} onChange={this.handleChange}/>
        </div>
        <div className="form-field">
          <label className="form-field__label" htmlFor="username">Username</label>
          <input className="form-field__input"type="text" id="username" value={this.state.username} onChange={this.handleChange}/>
        </div>
        <div className="form-field">
          <label className="form-field__label" htmlFor="server">Phoeyonce Server</label>
          <select id="server" name="server"value={this.state.server} onChange={this.handleChange}>
            {Object.keys(this.serverMap()).map(label => <option value={this.serverMap()[label]}>{label}</option> )}
          </select>
        </div>
        <div className="form-field">
          <label className="form-field__label"  htmlFor="type">Phoeyonce Server</label>
          <select id="type" name="type"value={this.state.type} onChange={this.handleChange}>
            <option value="jupyter">Jupyter Test</option>
            <option value="ide">IDE Test</option>
          </select>
        </div>
        <div>
          {this.state.type === "jupyter" && <input type="button" value="Run Tests" onClick={this.runTests}/>}
          <input type="submit" value="Connect" onClick={this.connect}/>
        </div>

        <div className='connection'>
          Connecting with token {this.state.token} to {this.state.server}. Channel name {this.state.type}:{this.state.username}:{this.state.labName}
        </div>

        <div>
          <div id='terminal'></div>
          <h2>Output</h2>
          {this.state.output.map((o) =>  <div>{o}</div> )}
        </div>
      </div>
    );
  }
}

export default App;

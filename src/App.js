import React, { Component } from 'react'
import { Socket } from 'phoenix'
import { Terminal } from 'xterm'
import 'xterm/dist/xterm.css'
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
      token: "5cb56f2e8b142fe4b59d41fc004b8f0ef549fa70fad7c9aae25475558a103426",
      //labName: "nearest-neighbors-lab-data-science-pilot",
      labName: "sandbox",
      server: "localhost",
      username: "StevenNunez",
      type: "ide",
      output: [],
    }
  }
  componentDidMount(){
    this.terminal.open(document.getElementById('terminal'));
    this.terminal.fit()
  }

  handleChange({target}){
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
      <div className="App">
        <div className="inputs">
          <div>
            Get this from your profile https://learn.co/StevenNunez
          </div>
          <label htmlFor="token">Learn Token</label>
          <input type="text" id="token" value={this.state.token} onChange={this.handleChange}/>

          <label htmlFor="labName">Lab Name</label>
          <input type="text" id="labName" value={this.state.labName} onChange={this.handleChange}/>

          <label htmlFor="username">Username</label>
          <input type="text" id="username" value={this.state.username} onChange={this.handleChange}/>

          <label htmlFor="server">Phoeyonce Server</label>
          <select id="server" name="server"value={this.state.server} onChange={this.handleChange}>
            <option value="localhost">Local</option>
            <option value="staging-01.ide.learn.co">Staging 01</option>
            <option value="staging-02.ide.learn.co">Staging 02</option>
          </select>

          <label htmlFor="type">Phoeyonce Server</label>
          <select id="type" name="type"value={this.state.type} onChange={this.handleChange}>
            <option value="jupyter">Jupyter Test</option>
            <option value="ide">IDE Test</option>
          </select>
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

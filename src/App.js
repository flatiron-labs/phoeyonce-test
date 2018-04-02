import React, { Component } from 'react';

class App extends Component {
  constructor(){
    super();
    this.handleChange = this.handleChange.bind(this)
    this.state = {
      token: "",
      labName: "",
      server: "staging-01.ide.learn.co",
      username: "",
    }
  }

  handleChange({target}){
    this.setState({[target.id]: target.value})
  }
  render() {
    return (
      <div className="App">
        <div className="inputs">
          <label htmlFor="token">Learn Token</label>
          <input type="text" id="token" value={this.state.token} onChange={this.handleChange}/>

          <label htmlFor="labName">Lab Name</label>
          <input type="text" id="labName" value={this.state.labName} onChange={this.handleChange}/>

          <label htmlFor="username">Username</label>
          <input type="text" id="username" value={this.state.username} onChange={this.handleChange}/>

          <label htmlFor="phoeyonce-server">Phoeyonce Server</label>
          <select id="server" name="server"value={this.state.server} onChange={this.handleChange}>
            <option value="staging-01.ide.learn.co">Staging 01</option>
            <option value="staging-02.ide.learn.co">Staging 02</option>
          </select>
        </div>
        <div className='connection'>
          Connecting with token {this.state.token} to {this.state.server}. Channel name {this.state.username}:{this.state.labName}
        </div>
      </div>
    );
  }
}

export default App;

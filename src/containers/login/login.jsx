import { connect } from 'react-redux'
import { login } from '../../redux/actions'
// 登录路由组件
import React, { Component } from 'react'
import {
  NavBar,
  WingBlank,
  List,
  InputItem,
  WhiteSpace,
  Button
} from 'antd-mobile'
import Logo from '../../components/logo/logo'
import '../../assets/css/index.less'
import {Redirect} from 'react-router-dom'
// const ListItem = List.Item

 class Login extends Component {
  state ={
    username:'',//用户名
    password:'',//密码
  }
  login =() =>{
    // console.log(this.props);
    this.props.login(this.state)
  }
  // 处理输入数据的改变：更新对应的状态
  handleChange =(name,val) =>{
    // 更新状态
    this.setState({
          [name]:val //属性名不是name，而是name变量的值
    })
  }
  toRegister =() =>{
    this.props.history.replace('/register')
  }
  render() {
    // const {type} = this.state
    const {msg,redirectTo} = this.props.user
    if(redirectTo){
      return <Redirect to={redirectTo}/>
    }
    return (
      <div>
        <NavBar>社团招聘</NavBar>
        <Logo/>
        <WingBlank>
          <List>
          {msg ? <div className='error-msg'>{msg}</div> : null}
            <InputItem placeholder='请输入用户名' onChange={val => {this.handleChange('username',val)}}>用户名：</InputItem>
            <WhiteSpace/>
            <InputItem placeholder='请输入密码' type='password' onChange={val => {this.handleChange('password',val)}}>密&nbsp;&nbsp;&nbsp;码：</InputItem>
            <WhiteSpace/>
            <WhiteSpace></WhiteSpace>
            <Button type='primary' onClick={this.login}>登&nbsp;&nbsp;录</Button>
            &nbsp;&nbsp;&nbsp;
            <Button onClick={this.toRegister}>还没有账户</Button>
          </List>
        </WingBlank>
      </div>
    )
  }
}
export default connect(
  state => ({user:state.user}),
  {login}
)(Login)

import React, { Component } from 'react'
import { TabBar } from 'antd-mobile'
import  PropsTypes  from 'prop-types'
import {withRouter} from 'react-router-dom'

const Item = TabBar.Item
//希望在非路由组件中使用路由库的api
// widthRoute（）
 class NavFooter extends Component {

    static propTypes = {
        navList: PropsTypes.array.isRequired,
        unReadCount: PropsTypes.number.isRequired
    }

  render() {
    let {navList,unReadCount} = this.props
    // 过滤掉hide为true的nav
    navList = navList.filter(nav => !nav.hide)
    const path = this.props.location.pathname //请求的path
    return (
      <TabBar>
        {
            navList.map((nav) => ( 
                <Item   key={nav.path} 
                badge={nav.path==='/message' ? unReadCount : 0}
                        icon={{uri: require(`./images/${nav.icon}.png`)}} 
                        selectedIcon={{uri: require(`./images/${nav.icon}-selected.png`)}}
                        selected={path===nav.path}
                        onPress={() => this.props.history.replace(nav.path)}
                        title={nav.text}/>
            ))
        }
            
      </TabBar>
    )
  }
}

//向外暴露widyjRouter（）包装产生的组件
// 内部会像组件中传入一些路由组件特有的属性：history/location/
export default withRouter(NavFooter) 
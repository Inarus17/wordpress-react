import React, { Component } from 'react';
import API from '../API.jsx';
import DataStore from '../Stores/DataStore.jsx';
import Menu from '../Components/Menu.jsx';

class WPFooterHooks extends Component {
	constructor(props){
		super(props);
		let _ = this;
		_.evalScripts = _.evalScripts.bind(_);
	}
	evalScripts(){
		var jq = window.jQuery,
			html = jq('#wp-footer-hooks').html();

		jq('#wp-footer-hooks').html('');
		jq('#wp-footer-hooks').append(html);

		if(DataStore.isCachedPage() == 1){
			API.triggerPageLoad();
			console.log('DataStore.isCachedPage: 1');
			console.log(DataStore.data.pages_cache);
		} else {
			console.log('DataStore.isCachedPage: 0');
		}
	}
	componentDidUpdate(prevProps, prevState) {
		let _ = this
		if( typeof _.props.current_page != 'undefined' ) {
			if(typeof prevProps.current_page == 'undefined'){
				_.evalScripts()
				return;
			}
			if(typeof prevProps.current_page.page_id != 'undefined' && prevProps.current_page.page_id != _.props.current_page.page_id){
				_.evalScripts();
				return;
			}
		}
	}
	render() {
		let _ = this;
		if( _.props.current_page != false && typeof _.props.current_page != 'undefined'){
			let { current_page } = _.props;
			var current_page_scripts = '',
				page_content_scripts = '',
				wp_footer_scripts = current_page.wp_footer;

			if(current_page.js.length > 0){
				page_content_scripts = '<script type="text/javascript">' + current_page.js[0].join('') + '<\/script>';
			}

			current_page_scripts = page_content_scripts + wp_footer_scripts;
		}

		return (
			<div id="wp-footer-hooks" dangerouslySetInnerHTML={{__html: current_page_scripts}}></div>
		);
	}
}

class Footer extends Component {
	constructor(props){
		super(props);
	}
	render() {
		let _ = this;
		return (
			<div className="container">
				footer content
				<Menu menu_name="Footer Menu" id="footer-menu" {..._.props} {..._.state} />
				<WPFooterHooks {..._.props} />
			</div>
		);
	}
}

export default Footer;

import React, {Component} from "react";
import widthRouter from 'react-router-dom';
import ReactDOM from "react-dom";
import DeckTable from '../../../../../Phoenix/src/js/components/utility/ViolationTable.js';
import Header from "../Layout/Header.js";
import ViolationTable from "../../../../../Phoenix/src/js/components/AllTagsResults/Scan/ViolationSummary";
import Scan from "../../../../../Phoenix/src/js/components/utility/Scan.js";
import ajaxCall from "../../../../../Phoenix/src/js/components/utility/ajaxCall.js";
import CarouselModalM from "../../../../../Phoenix/src/js/components/utility/CarouselModal";
import {getViolationImage} from "../../../../../Phoenix/src/js/components/utility/Violation.js";
import {library} from '@fortawesome/fontawesome-svg-core'
import {
    faQuestionCircle,
    faEnvelopeOpen,
    faUsers,
    faFileUpload,
    faUser,
    faArrowUp,
    faArrowDown,
    faCheckCircle,
    faTags,
    faQuestion,
    faChevronLeft,
    faMobileAlt,
    faDesktop,
    faWindowRestore,
    faGlobeAmericas,
    faCookieBite,
    faSave,
    faUnlink
} from "@fortawesome/free-solid-svg-icons/";
import {faChartBar} from "@fortawesome/free-regular-svg-icons/";

library.add(faQuestionCircle, faEnvelopeOpen, faUsers, faFileUpload, faUser, faChartBar, faArrowUp, faArrowDown, faCheckCircle, faTags, faQuestion, faChevronLeft, faMobileAlt, faDesktop, faWindowRestore, faGlobeAmericas, faCookieBite);
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

const queryString = require('query-string');
let setNum = 0;
let iterate = {};
let incSetNum = (n = 1) => {
    setNum += n;
}

class DeckScan extends Component {


    constructor(props) {
        super(props);
        const parsed = queryString.parse(location.search);
        console.log(parsed);
        this.state = {
            tsid: (parsed.tsid ? parsed.tsid : null),
            csid: (parsed.csid ? parsed.csid : null),
            viewScan: false,
            headerData: null,
            md5sum: null,
            title: "",
            data: {},
            filterData: {},
            priorityFilter: "all",
            dataFirstTry: false,
            isSetData: false,
            carouselData: null,
            isShownCarouselModal: false,
            isShownCarousel: false,
            htmlTableComponent: {
                violations: null,
                priority: null
            }
        };

    }


    viewScan = (csid, md5sum) => {
        let handleResponse = responseData => {
            let state = {};
            state.viewScan = true;
            state.csid = csid;
            state.md5sum = md5sum;
            this.setState(state);
        };
        let queryParams = {};
        queryParams.controller = 'deck/scan';

        new Promise(() => {
            ajaxCall
                .get(queryParams)
                .then(responseData => handleResponse(responseData));
        });

    }
    setPriorityFilter = (value) => {
        let holdDeck = [];
        let all = false;
        if (isNaN(value)) {
            all = true;
            holdDeck = this.state.data;
        } else {
            value = value * 1;
        }
        if (all === false) {
            for (var index in this.state.data) {
                if (this.state.data[index].priority === value) {
                    holdDeck[index] = this.state.data[index];
                }
            }
        }

        this.state.filterData = holdDeck;
        this.filterDecks();
        this.setState({
            priorityFilter: value,
        });
    }
    dataSet(dataResponse) {
        this.setState({
            headerData: dataResponse.counts,
            data: dataResponse.data,
            filterData: dataResponse.data,
            isSetData: true,
        });
    }



    dataNotSet() {
        this.setState({
            dataFirstTry: true,
        })
    }

    LaunchCarousel = (event, elid, dataCarousel) => {

        if (this.state.isShownCarouselModal === false) {
            if (dataCarousel.length > 0) {
                this.setState({
                    carouselData: dataCarousel
                });
            }
            /*let myResolve = responseData => {

             };
             //Parameters
             let queryParams = {};
             queryParams.controller = 'tagmanager/carousel_images';
             queryParams.elid = elid;

             new Promise(() => {
             ajaxCall
             .get(queryParams)
             .then(responseData => myResolve(responseData));
             });*/
        } else {
            this.setState({
                carouselData: null
            });
        }
        this.setState({
            isShownCarouselModal: !this.state.isShownCarouselModal
        })
    }

    goBackToDecks() {
            this.props.history.goBack();
    }

    grabData() {
        let that = this;

        let handleResponse = responseData => {
            if (responseData === "false") {
                incSetNum(1);
                if (setNum === 5) {
                    this.dataNotSet();
                    return;
                }
                setTimeout(function () {
                    that.grabData();
                }, 2000);
            } else {
                this.dataSet(responseData);
            }

        };
        let queryParams = {};
        queryParams.controller = 'deck/default';
        queryParams.tsid = this.state.tsid;
        new Promise(() => {
            ajaxCall
                .get(queryParams)
                .then(responseData => handleResponse(responseData));
        });
    }

    render() {
        console.log(this.state);
        if (this.state.csid === null) {
            iterate.html =
                <div className="datatable_message">Invalid requests</div>
        } else {
            if (this.state.isSetData === false && this.state.dataFirstTry === false) {
                this.grabData();
                iterate.html = <div  className="datatable_message">Loading... </div>;
            } else if (this.state.dataFirstTry === true) {
                iterate.html = <div  className="datatable_message">The request you made has timed out, please refresh the page.</div>;
            } else {
                console.log('we got here');
            }

        }


        return (
            <div className="deck_body">
                <Header title={"Decks"} data={this.state.headerData} priority={this.state.priorityFilter}
                        priorityFilterFn={this.setPriorityFilter.bind(this.state.priorityFilter)}/>
                <div className="deck_view">

                        <div className="deck_can_view">
                            <div className="tag_view_scan_violation">
                                <div className="mdh_main">


                                    <div className="tag_viewp" id="tag_viewp">
                                        <div className='all_results'>
                                            <div className="all_title">
                                                <button className="all_goback" onClick={this.goBackToDecks.bind(this)}>
                                                    <FontAwesomeIcon icon={faChevronLeft}/> Back
                                                </button>
                                            </div>

                                            <div className="all_results_viewp">
                                                <div className="all_summary malware">
                                                    <div className="all_summary_scroll">
                                                        <Scan csid={this.state.csid} md5sum={this.state.md5sum}
                                                              key={this.state.tsid} launchCarousel={this.LaunchCarousel}
                                                              options={{
                                                                  showActions: true,
                                                                  showExport: true,
                                                                  getActions: true
                                                              }}/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                </div>
                <CarouselModalM show={this.state.isShownCarouselModal} onClose={this.LaunchCarousel}
                                carouselData={this.state.carouselData} key={this.state.carouselData}>

                </CarouselModalM>
            </div>

        );

    }
}

export default DeckScan;
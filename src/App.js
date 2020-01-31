import React from 'react';
import './App.css';
import Autosuggest from 'react-autosuggest';


class App extends React.Component {
    constructor() {
        super();
        this.state = {
            value: '',
            suggestions: [],
            results: []
        }
    }

    onSuggestionsFetchRequested = ({value,}) => {
        console.log(value);
        fetch(`http://localhost:5000/suggestions/${value}`).then(response => response.json()).then(suggestions => {
            console.log(suggestions);
            this.setState({suggestions})
        })
    };

    onSuggestionsClearRequested = () => {
        this.setState({suggestions: []})
    };

    onChange = (event, {newValue}) => {
        console.log(newValue);
        this.setState({value: newValue})
    };
    onSuggestionSelected = (event, {suggestion}) => {
        fetch(`http://localhost:5000/entries/${suggestion}`).then(response => response.json()).then(results => {
            console.log(results);
            this.setState({results})
        })
    };

    mapEntry = (entry, index) => {
        if (entry.startsWith("#")) {
            const res = {
                domain: "",
                definition: "",
                examples: [],
                link: ""

            };
            const defElems = entry.split("##").filter(Boolean).map(entry => entry.split(/[{}\[\]]/).filter(Boolean).join(""));
            defElems.forEach(element => {
                if (element.startsWith("K:")) {
                    res.domain = element.substring(3)
                } else if (element.startsWith("D:")) {
                    res.definition = element.substring(3)
                } else if (element.startsWith("P:")) {
                    res.examples.push(element.substring(3))
                } else if (element.startsWith("L:")) {
                    res.link = element.substring(3)
                }
            });
            const domainSection = res.domain !== "" ?
                (<div>
                    <h3>Domena</h3>
                    <p>{res.domain}</p>
                </div>) : (<div/>);
            const definitionSection = res.definition !== "" ?
                (
                    <div>
                        <h3>Definicja</h3>
                        <p>{res.definition}</p>
                    </div>
                ) : (<div/>);
            const examplesSection = res.examples.length !== 0 ?
                (
                    <div>
                        <h3>Przykłady</h3>
                        {res.examples.map(example => <p>{example}</p>)}
                    </div>
                ) : (<div/>);
            console.log(res.link)
            const linkSection = res.link !== "" ?
                (
                    <div>
                        <h3>Link</h3>
                        <a href={res.link}>{decodeURI(res.link)}</a>
                    </div>
                ) : (<div/>);
            return (<div className={index % 2 === 0 ? "definition-even" : "definition-odd "}>
                {domainSection}
                {definitionSection}
                {examplesSection}
                {linkSection}
            </div>);
        } else return (<div className={index % 2 === 0 ? "definition-even" : "definition-odd "}>{entry}</div>)
    };
    mapDefinitions = definitions => {
        const polnetReduced = definitions.polnet.reduce((a, b) => a.concat(b), []);
        const polnetEntries = (<div className="entries">
            <div className="entries-header">
                <h2>Definicje pochodzące ze słownika Polnet</h2>
                <p>Więcej informacji pod adresem: <a href="http://ltc.amu.edu.pl/polnet/">PolNet</a></p>
            </div>
            <div className="entries-content">
                {polnetReduced.map((entry, index) => this.mapEntry(entry, index))}
            </div>
        </div>);
        const wordnetEntries = (
            <div className="entries">
                <div className="entries-header">
                    <h2>Definicje pochodzące ze słownika plwordnet</h2>
                    <p>Więcej informacji pod adresem: <a href="http://plwordnet.pwr.wroc.pl/wordnet/">Słowosieć</a></p>

                </div>
                <div className="entries-content">
                    {definitions.wordnet.map((entry, index) => this.mapEntry(entry, index))}
                </div>
            </div>
        );
        return (
            <div>
                {wordnetEntries}
                {polnetEntries}
            </div>
        )
    };

    render() {
        const {value} = this.state;
        const inputProps = {
            placeholder: 'Wpisz początek słowa aby wyszukać definicję',
            value: value,
            onChange: this.onChange
        };

        return (
            <div className="App">
                <Autosuggest
                    suggestions={this.state.suggestions}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                    getSuggestionValue={(value) => value}
                    renderSuggestion={(value) => (<div>{value}</div>)}
                    onSuggestionSelected={this.onSuggestionSelected}
                    inputProps={inputProps}
                />
                <div className="cards-container">
                    {this.state.results.map(result => {
                        return (
                            <div className="card">
                                <h1 className="card-header">{result.name}</h1>
                                <h2 className="card-header">{result.pos}</h2>
                                <div className="card-body">
                                    {this.mapDefinitions(result.desc)}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    };
}

export default App;

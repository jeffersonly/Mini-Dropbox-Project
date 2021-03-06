import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { API, graphqlOperation, Auth }  from "aws-amplify";
import * as queries from '../graphql/queries';

import DownloadItem from './downloadItem';

const styles = {
  card: {
    minWidth: 275,
    margin: 10,
    boxShadow: "1px 2px 2px black"
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  titlelabel: {
    fontSize: 30, 
    fontWeight: 800,
    fontColor: 'black',
    textDecorationLine: 'underline',
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
    fontColor: 'black',
  },
  dates: {
    fontSize: 14,
    fontWeight: 350,
  },
  description: {
    fontSize: 16,
    fontWeight: 400
  },
  span: {
      fontSize: 14,
      color: "gray"
  },
  pos: {
    marginBottom: 12,
  },
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'inherit',
    padding: '10px'
  },
};

class ListItems extends Component {
    state = {
        items: [],
        userID: '',
    }

    //when site loads, call function get items
    async componentDidMount () {
        Auth.currentSession()
            .then(data => {
                let idToken = data.getIdToken();
                this.setState({
                    userID: idToken.payload["cognito:username"]
                })

                //wait until user is checked, then get items
                this.getItems()
            })
    }
    
    //get items from dynamodb 
    getItems = () => {
        //check to see if user is the one who posted, if they aren't display download/view only
        API.graphql(graphqlOperation(queries.listItems, {
            filter: {
                userID: {
                    ne: this.state.userID
                    //eq: this.state.userID
                }
            }
        }))
        .then(data => this.setState({items: data.data.listItems.items}))
    };

    render() {
        const { classes } = this.props;
        const { items } = this.state;
        //const bull = <span className={classes.bullet}>•</span>;
        //console.log(items)
        return (
            <div className={classes.root}>
                <h1 className={classes.titlelabel}>Other Files</h1>
                <Grid container className={classes.root} spacing={16}>
                    {items.map(item => (
                        <Grid key={item.id} item>
                            <Card className={classes.card}>
                                <CardContent>
                                    <Typography className={classes.title}>
                                        {item.name}
                                    </Typography>
                                    <br/>
                                    <Typography component="p" color="textSecondary" className={classes.dates}> 
                                        Upload Date: {item.dateUploaded}
                                        <br/>
                                        Edited Date: {item.dateEdited}
                                        <br/>
                                        File Size: {item.fileSize} bytes
                                    </Typography>
                                    <br/>

                                    <Typography component="p" className={classes.description}>
                                        <span className={classes.span}>Description:</span>
                                        &nbsp;
                                        {item.description}
                                    </Typography>

                                </CardContent>
                                    
                                <CardActions>
                                    <DownloadItem currentItem={item} />
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </div>
        );
    }
}

ListItems.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ListItems);
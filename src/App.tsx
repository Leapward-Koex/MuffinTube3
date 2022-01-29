import React from 'react';
import logo from './logo.svg';
import './App.css';
import { VideoInput } from './components/videoInput';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import { DownloadTask } from './components/downloadTask';
import ytdl from 'ytdl-core'
import createHttpProxyAgent from 'http-proxy-agent';
//import ProxyAgent from 'proxy-agent';
import nodeProcess from 'process'

window.process = nodeProcess

const agent = createHttpProxyAgent('http:/103.126.150.177:80/');


var url = require('url');
var http = require('http')



var opts = {
    method: 'GET',
    host: 'nodejs.org/api/',
    path: '/',
    // this is the important part!
    // If no proxyUri is specified, then https://www.npmjs.com/package/proxy-from-env
    // is used to get the proxyUri.
    agent: createHttpProxyAgent('http://103.126.150.177:80')
  };
  
  // the rest works just like any other normal HTTP request
  http.get(opts, onresponse);
  
  function onresponse (res: any) {
    console.log(res.statusCode, res.headers);
    res.pipe(process.stdout);
  }



export const App = () => {

    const onVideoSubmitted = async (videoId: string) => {
        const thumbnailUrl = `https://img.youtube.com/vi/l4WjAiBFYjw/maxresdefault.jpg`;
        // let info = await ytdl.getInfo('5TZ5twGgu9Y');
        // let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
        debugger
        const stream = ytdl('https://www.youtube.com/watch?v=5TZ5twGgu9Y', {
            requestOptions: { agent: createHttpProxyAgent('http://103.126.150.177:80') }
        });

        stream.on('data', chunk => {
            console.log('downloaded', chunk.length);
        });

        stream.on('error', err => {
            console.error(err);
        });

        stream.on('end', () => {
            console.log('Finished');
        });
    }
    // l4WjAiBFYjw

    return (
        <Container className="App" style={{ width: 400 }}>
            <div className="video-input-container">
                <VideoInput onSubmit={(videoId) => onVideoSubmitted(videoId)}></VideoInput>
            </div>
            <Stack spacing={2} className="downloads-container">
                <DownloadTask videoId={'l4WjAiBFYjw'} onCompleted={() => { }} />
            </Stack>
        </Container >
    );
}

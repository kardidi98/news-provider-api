const Port = process.env.PORT || 9090
const express = require('express')
const axios  = require('axios')
const cheerio = require('cheerio')
const { response } = require('express')
const app = express()
app.listen(Port, () => console.log('Listening to port: '+ Port))
const address = 'https://www.theguardian.com/'
const guardianTopics = [
    {
        name: 'culture',
        subtopics:'books,music,tv-and-radio,artanddesign,film,games,classical-music-and-opera,stage'
    },
    {
        name: 'lifeandstyle',
        subtopics:'fashion,food,recipes,health-and-wellbeing,home-and-garden,women,men,family'
    },
    {
        name: 'news',
        subtopics:'climate-crisis,science,global-development,technology,home-and-garden,women,men,family'
    }
]
articles = []
errors = []

app.get('/', (req, res)=>{
    res.json(guardianTopics)
})

app.get('/:topic/:subtopic', (req, res)=>{
    const topic = guardianTopics.filter(topic => topic.name == req.params.topic.toLowerCase())
    const topicName = topic[0] == undefined ? '':topic[0].name
    const subTopicName = topic[0] == undefined ? '':topic[0].subtopics.split(',').filter(sub => sub == req.params.subtopic.toLowerCase())

    if(topicName != '' && subTopicName != ''){
        axios.get(address+subTopicName).then((response)=>{
            const html = response.data
            const $ = cheerio.load(html)
            
            $('a', html).each(function() {
                if(String($(this).attr('href')).split('/')[3] == (subTopicName) || String($(this).attr('href')).split('/')[3] == (topicName)){
                    const arrayLength = articles.length
                    const title = $(this).text().trim()
                    const url = $(this).attr('href')
                    if(arrayLength == 0 ||(arrayLength > 0 && articles.find(elt => elt.title == title) == undefined)){
                        articles.push({
                            title,
                            url
                        })
                    }                
                }
            })
            res.json(articles)
        }).catch((err)=>{
            errors.push({
                error: 'System Error',
                message: err
            })
            res.json(errors)
        })
    }
    else{
        errors.push({
            error: 'Incorrect Topic or SubTopic',
            message: 'Please respect the topics and subtopics names',
            topics: guardianTopics
        })
        res.json(errors)
    }
    errors = []
    articles = []

})
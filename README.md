must have sam-cli installed

https://github.com/apache/tinkerpop/tree/master/gremlin-javascript/src/main/javascript/gremlin-javascript/lib/process
https://stackoverflow.com/questions/51374763/why-does-gremlin-javascript-use-from-mapping-instead-of-from

## gremlin console

https://docs.aws.amazon.com/neptune/latest/userguide/access-graph-gremlin-console.html

1. download gremlin client
2. configure in conf/neptune-remote.yaml
    ``` yaml
    hosts: [xxxxxxxxxxxxx.us-east-2.neptune.amazonaws.com]
    port: 8182
    serializer: { className: org.apache.tinkerpop.gremlin.driver.ser.GryoMessageSerializerV3d0, config: { serializeResultToString: true }}
    ```
3. enter commands:
    ``` bash
    $ bin/gremlin.sh
    
    gremlin> :remote connect tinkerpop.server conf/neptune-remote.yaml
    gremlin> :remote console
    
    ...
    
    gremlin> :exit
    ```

** Note that connection issues will not be reported until you try to execute a command

## sample data

``` gremlin

gremlin> g.addV('User').property('name', 'Josh').
           addV('User').property('name', 'Naomi').
           addV('User').property('name', 'Audrey').iterate()
           
gremlin> g.addV('Session').property('title', 'Session #1').
           addV('Session').property('title', 'Session #2').
           addV('Session').property('title', 'Session #3').
           addV('Session').property('title', 'Session #4').
           addV('Session').property('title', 'Session #5').iterate()
         
gremlin> g.V().has('User', 'name', 'Josh').as('p').
           V().has('Session', 'title', 'Session #1').addE('registered').from('p').
           V().has('Session', 'title', 'Session #2').addE('registered').from('p').iterate()
           
gremlin> g.V().has('User', 'name', 'Naomi').as('p').
           V().has('Session', 'title', 'Session #1').addE('registered').from('p').
           V().has('Session', 'title', 'Session #2').addE('registered').from('p').
           V().has('Session', 'title', 'Session #3').addE('registered').from('p').iterate()
           
gremlin> g.V().has('User', 'name', 'Audrey').as('p').
           V().has('Session', 'title', 'Session #5').addE('registered').from('p').
           V().has('Session', 'title', 'Session #4').addE('registered').from('p').
           V().has('Session', 'title', 'Session #2').addE('registered').from('p').iterate()

```
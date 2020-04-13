# amq-queue-drainer
A commandline nodejs app to drain AMQP message queues.  Now one could use the Rabbit management console to purge messages or write your own consumer but if neither of these are an option then this quick cli will do it for you either continually consuming any message to a queue or consuming a set number.  It is written in Typescript so it will need building with npm.

## Install
Git clone then `npm install && npm run build`

## Use
```
$ node .
   ___      ____                   _                       
  / _ \    |  _ \   _ __    __ _  (_)  _ __     ___   _ __ 
 | | | |   | | | | | '__|  / _` | | | | '_ \   / _ \ | '__|
 | |_| |   | |_| | | |    | (_| | | | | | | | |  __/ | |   
  \__\_\   |____/  |_|     \__,_| |_| |_| |_|  \___| |_|   
                                                           
one or more missing arguments
Usage: queue-drainer [options]

Options:
  -V, --version              output the version number
  -h, --host [host]          rabbit host
  -p, --port [port]          rabbit port [5672] (default: 5672)
  -v, --vhost [vhost]        virtual host [/] (default: "")
  -u, --user [user]          rabbit user
  -c, --password [password]  rabbit password
  -q, --queue [queue]        queue name e.g. queue1
  -l, --log-message          log the dequeued message
  -n, --num-to-consume       number of messages to consume [default all]
  -h, --help                 output usage information
```
To connect to a broker with a queue named test_q consume and log all messages, in this case a local one, run with the following:
```
$ node . -h localhost -p 5672 -q test_q -l
 _____     _____  _____  _____  ___  _____  _____  _____ 
/  _  \   |  _  \/  _  \/  _  \/___\/  _  \/   __\/  _  \
|  |  |   |  |  ||  _  <|  _  ||   ||  |  ||   __||  _  <
\___\ \   |_____/\__|\_/\__|__/\___/\__|__/\_____/\__|\_/
      /                                                  
connecting to... amqp://localhost:5672
 [*] Waiting for messages in test_q. To exit press CTRL+C
did
message: 1 ✅
waiting.. \ ^C
```

`CTRL-C` to exit.

Additional options to support virtual hosts, don't log messages and authentication are supported.


# amq-queue-drainer [![Typescript-build](https://github.com/eharrow/amq-queue-drainer-ts/actions/workflows/main.yml/badge.svg)](https://github.com/eharrow/amq-queue-drainer-ts/actions/workflows/main.yml)

A commandline nodejs app to drain AMQP message queues. Now one could use the Rabbit management console to purge messages or write your own consumer but if neither of these are an option then this quick cli will do it for you either continually consuming any message to a queue or consuming a set number. It is written in Typescript so it will need building with npm.

_NEW_ v1.2.0 now supports queue filling i.e. has a new mode to publish to a queue

## Install

`git clone git@github.com:eharrow/amq-queue-drainer.git` then install it on your path using `npm install -g .`

## Use

### Queue Drainer

```
$ qdrainer
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
$ qdrainer -h localhost -p 5672 -q test_q -l
 _____     _____  _____  _____  ___  _____  _____  _____ 
/  _  \   |  _  \/  _  \/  _  \/___\/  _  \/   __\/  _  \
|  |  |   |  |  ||  _  <|  _  ||   ||  |  ||   __||  _  <
\___\ \   |_____/\__|\_/\__|__/\___/\__|__/\_____/\__|\_/
      /                                                  
connecting to... amqp://localhost:5672
 [*] Waiting for messages in test_q. To exit press CTRL-C
did
message: 1 ✅
waiting.. \ ^C
```

<kbd>CTRL-C</kbd> to exit.

Additional options to support virtual hosts, don't log messages and authentication are supported.

### Queue Filler

Supports the same arguments and waits after connecting for messages to send…

```
$ qfiller
 _____                  ____            ___       ___                     
/\  __`\               /\  _`\   __    /\_ \     /\_ \                    
\ \ \/\ \              \ \ \L\_\/\_\   \//\ \    \//\ \       __    _ __  
 \ \ \ \ \              \ \  _\/\/\ \    \ \ \     \ \ \    /'__`\ /\`'__\
  \ \ \\'\\              \ \ \/  \ \ \    \_\ \_    \_\ \_ /\  __/ \ \ \/ 
   \ \___\_\              \ \_\   \ \_\   /\____\   /\____\\ \____\ \ \_\ 
    \/__//_/               \/_/    \/_/   \/____/   \/____/ \/____/  \/_/ 
                                                                          
                                                                          
connecting to... amqp://localhost:5672
 [*] Waiting for messages to send to test_q. CTRL-C to exit
✔ Message to publish? … Hello World!
? Message to publish? ›
```

## Uninstall

`npm uninstall -g amq-queue-drainer`

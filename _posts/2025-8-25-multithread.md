---
title: 'Java多线程高并发'
date: 2025-08-25
permalink: /posts/2025/08/multithread/
tags:
  - Java
  - multithread
  - threadpool
---

This is my Java multi-threading self-taught notes from bilibili. Not recommended for learning, because the information is not first-hand.
Java多线程自学笔记，从哔哩哔哩上找的网课。不建议照这个笔记学，建议去寻找一手信息。

### Java 多线程

#### 概念

* 线程是进程的最基本执行单位
* 线程是CPU调度的最小单位
* 在同一时间需要完成多项任务的时候需要线程



#### 创建线程的三种方式

1. 继承Thread类
2. 实现Runnable接口
3. 实现Callable接口



##### 继承Thread类

单继承，无返回值

```java
public class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("把要执行的业务代码写到run方法里");
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        MyThread myThread = new MyThread();
        myThread.start();
    }
}
```

##### 实现Runnable接口

无返回值

```java
public class Task implements Runnable {
    @Override
    public void run() {
        System.out.println("实现Runnable接口");
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        Thread thread = new Thread(task);
        thread.start();
    }
}
```

##### 实现Callable接口

有返回值

```java
public class Result implements Callable<String> {
    @Override
    public String call() throws Exception {
        return "将要执行的任务写在call方法里面并返回执行结果";
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        Result result = new Result();
        FutureTask<String> futureTask = new FutureTask<>(result);
        Thread thread = new Thread(futureTask);
        thread.start();
        try {
            String str = futureTask.get();
            System.out.println(str);
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        }
    }
}
```



#### 获取当前正在执行任务的线程

```java
public class Main {
    public static void main(String[] args) {
        Thread thread = Thread.currentThread();
        System.out.println(thread);
    }
}
```

**输出**：Thread[main,5,main]

**解释**：Thread[线程的名称,线程的优先级,线程所属的线程组名称]

Thread类源码中，重写toString方法获得上面三个信息

```java
public String toString() {
    ThreadGroup group = getThreadGroup();
    if (group != null) {
        return "Thread[" + getName() + "," + getPriority() + "," +
                       group.getName() + "]";
    } else {
        return "Thread[" + getName() + "," + getPriority() + "," +
                        "" + "]";
    }
}
```



#### 获取和设置线程名称

##### 获取线程名称

```java
public class Main {
    public static void main(String[] args) {
        Thread thread = Thread.currentThread();
        String threadName = thread.getName();
        System.out.println(threadName);
    }
}
```

##### 设置线程名称

```java
public class Main {
    public static void main(String[] args) {
        Thread thread = Thread.currentThread();
        String threadName = thread.getName();
        System.out.println(threadName);
        thread.setName("Neko");
        threadName = thread.getName();
        System.out.println(threadName);
    }
}
```



#### run方法与start方法区别

1. 位置
2. 类型
3. 作用
4. 线程数量
5. 调用次数

| 方法名称 |    位置    |    类型    |     作用     |     线程数量     | 调用次数 |
| :------: | :--------: | :--------: | :----------: | :--------------: | :------: |
|   run    | Thread类中 | 非同步方法 | 存放任务代码 |  不会产生新线程  |  无数次  |
|  start   | Thread类中 |  同步方法  |   启动线程   | 会产生一个新线程 |   一次   |



#### 获取和设置线程优先级

##### 获取和设置

优先级由低到高：1 -> 10

```java
public class Main {
    public static void main(String[] args) {
        Thread thread = Thread.currentThread();
        int priority = thread.getPriority();
        System.out.println(priority);
        thread.setPriority(Thread.MAX_PRIORITY);
        priority = thread.getPriority();
        System.out.println(priority);
    }
}
```

##### 三个常量

最小优先级：Thread.MIN_PRIORITY

默认优先级：Thread.NORM_PRIORITY

最大优先级：Thread.MAX_PRIORITY



#### 使当前正在执行的线程进入休眠状态

##### 休眠函数

```java
public static void sleep(long millis, int nanos) throws InterruptedException
```

##### 两种异常

1. 参数超出范围IllegalArgumentException
2. 被中断InterruptedException

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("before");
        try {
            Thread.sleep(1000, 9999);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("after");
    }
}
```



#### 优雅地停止线程

##### 停止正在运行的线程

下面程序并不能使运行中的线程中断

要使线程中断，要在线程中主动判断中断标记

```java
public class Task implements Runnable {
    @Override
    public void run() {
        while (true) {
            System.out.println("Task 4 is running");
        }
    }
}
```

```java
public class Main {
    public static void main(String[] args) throws InterruptedException {
        Task task = new Task();
        Thread thread = new Thread(task);
        thread.start();
        Thread.sleep(1000);
        thread.interrupt();
    }
}
```

方法一：使用非静态方法isInterrupted

```java
public boolean isInterrupted()
```

```java
public class Task implements Runnable {
    @Override
    public void run() {
        while (true) {
            Thread thread = Thread.currentThread();
            if (thread.isInterrupted()) {
                break;
            }
            System.out.println("Task 4 is running");
        }
    }
}
```

这种方法**不会**清除中断标记，输出如下：

> false false false true true true true ...

方法二：使用静态方法interrupted

```java
public static boolean interrupted()
```

```java
public class Task implements Runnable {
    @Override
    public void run() {
        while (true) {
            if (Thread.interrupted()) {
                break;
            }
            System.out.println("Task 4 is running");
        }
    }
}
```

这种方法**会**清除中断标记，输出如下：

> false false false true false false false ...

##### 停止休眠中的线程

```java
public class Task implements Runnable {
    @Override
    public void run() {
        try {
            Thread.sleep(10000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

报错

> java.lang.InterruptedException: sleep interrupted
> 	at java.base/java.lang.Thread.sleep(Native Method)
> 	at com.neko.four.Task.run(Task.java:18)
> 	at java.base/java.lang.Thread.run(Thread.java:833)

##### 总结

|   方法名称    |    类型    |                作用                |
| :-----------: | :--------: | :--------------------------------: |
|   interrupt   | 非静态方法 |              中断线程              |
| isInterrupted | 非静态方法 |         判断线程是否被中断         |
|  interrupted  |  静态方法  | 判断线程是否被中断，并清除中断标记 |



#### 让线程放弃执行权

##### yield

静态方法，使线程放弃执行权

```java
class ValueTask implements Runnable {

    public static int value = 0;

    @Override
    public void run()
    {
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        value = 100;
    }
}
```

```java
class PrintTask implements Runnable {
    @Override
    public void run()
    {
        while (ValueTask.value == 0) {
            Thread.yield();
        }
        System.out.println(ValueTask.value);
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        PrintTask printTask = new PrintTask();
        ValueTask valueTask = new ValueTask();
        Thread printThread = new Thread(printTask);
        Thread valueThread = new Thread(valueTask);
        printThread.start();
        valueThread.start();
    }
}
```

##### 关键代码

这段代码printTask线程让出了执行权，允许valueTask赋值

```java
while (ValueTask.value == 0) {
	Thread.yield();
}
```

这段代码由于printTask线程未让出执行权，导致会一直死循环

```java
while (ValueTask.value == 0) {
	continue;
}
```



#### 等待线程死亡

##### join

非静态方法，等待该线程死亡

```java
public class TaskOne implements Runnable {
    @Override
    public void run() {
        System.out.println(1);
    }
}
```

```java
public class TaskTwo implements Runnable {

    private Thread thread;

    @Override
    public void run() {
        try {
            thread.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println(2);
    }

    public void setThread(Thread thread) {
        this.thread = thread;
    }
}
```

```java
public class TaskThree implements Runnable {

    private Thread thread;

    @Override
    public void run() {
        try {
            thread.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println(3);
    }

    public void setThread(Thread thread) {
        this.thread = thread;
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        TaskOne taskOne = new TaskOne();
        TaskTwo taskTwo = new TaskTwo();
        TaskThree taskThree = new TaskThree();
        Thread threadOne = new Thread(taskOne);
        Thread threadTwo = new Thread(taskTwo);
        Thread threadThree = new Thread(taskThree);
        taskTwo.setThread(threadOne);
        taskThree.setThread(threadTwo);
        threadOne.start();
        threadTwo.start();
        threadThree.start();
    }
}
```

输出结果

> 1 2 3



#### 后台线程Daemon

##### 设置后台线程

setDaemon非静态方法

```java
public class PrintTask implements Runnable {
    @Override
    public void run() {
        while (true) {
            System.out.println("Task 7 is running");
        }
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        PrintTask printTask = new PrintTask();
        Thread thread = new Thread(printTask);
        thread.setDaemon(true);
        thread.start();
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

随着主线程结束，后台线程随之结束

##### 判断后台线程

isDaemon非静态方法

```java
public class Main {
    public static void main(String[] args) {
        PrintTask printTask = new PrintTask();
        Thread thread = new Thread(printTask);
        System.out.println(thread.isDaemon());
        thread.setDaemon(true);
        System.out.println(thread.isDaemon());
        thread.start();
    }
}
```

输出：

> false
> true



#### 判断线程是否执行完

##### isAlive

非静态方法，判断该线程是否存活

随便创建一个空任务的线程，在主线程里判断

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        Thread thread = new Thread(task);
        System.out.println(thread.isAlive());
        thread.start();
        System.out.println(thread.isAlive());
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println(thread.isAlive());
    }
}
```

输出：

> false
> true
> false



#### 线程组

##### 获取线程组

getThreadGroup非静态方法

```java
public class Main {
    public static void main(String[] args) {
        Thread thread = Thread.currentThread();
        ThreadGroup threadGroup = thread.getThreadGroup();
        System.out.println(threadGroup);
    }
}
```

输出：

> java.lang.ThreadGroup[name=main,maxpri=10]
>
> 线程组对象类型[线程组名称,线程组最大优先级]

##### 创建和设置线程组

ThreadGroup类提供的几种构造函数：

```java
public ThreadGroup(String name)

public ThreadGroup(ThreadGroup parent, String name)
```

Thread类提供的几种将线程包含进线程组的构造函数：

```java
public Thread(ThreadGroup group, Runnable target)

public Thread(ThreadGroup group, String name)
    
public Thread(Runnable target, String name)

public Thread(ThreadGroup group, Runnable target, String name)
```

创建一个线程组和一个线程，把线程包含进线程组

```java
public class Main {
    public static void main(String[] args) {
        ThreadGroup threadGroup = new ThreadGroup("Neko");
        Thread thread = new Thread(threadGroup, "666");
        System.out.println(thread);
    }
}
```

输出：

> Thread[666,5,Neko]

##### 线程组方法

|    方法名称    |             作用             |
| :------------: | :--------------------------: |
|    getName     |        获取线程组名称        |
| setMaxPriority |     设置线程组最大优先级     |
| getMaxPriority |     获取线程组最大优先级     |
|  activeCount   | 获取线程组中存活的线程的数量 |
|   interrupt    |     中断线程组中所有线程     |



#### synchronized

##### 概念

可以用来给对象和方法或者代码块加锁，当它锁定一个方法或者一个代码块的时候，同一时刻最多只有一个线程执行这段代码

被synchronized修饰的代码，**同一时刻最多只有一个线程执行这段代码**

1. 同步代码块（同步对象）

   ```java
   synchronized (object) {
   
   }
   ```

2. 同步方法

   ```java
   访问修饰符 synchronized 返回值类型 方法名 (参数类型 参数名称) {
   
   }
   ```

3. 静态同步方法

   ```java
   访问修饰符 static synchronized 返回值类型 方法名 (参数类型 参数名称) {
   
   }
   ```

##### 例子

下面卖车票例子的代码，打印输出后发现卖了3张10号票

```java
public class Task implements Runnable {

    private int quantity = 10;

    @Override
    public void run() {
        while (quantity > 0) {
            System.out.println(quantity);
            --quantity;
        }
    }
}
```

这里创建了3个卖票线程

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        Thread thread1 = new Thread(task);
        Thread thread2 = new Thread(task);
        Thread thread3 = new Thread(task);
        thread1.start();
        thread2.start();
        thread3.start();
    }
}
```

输出如下：

> 10
> 9
> 10
> 10
> 7
> 5
> 4
> 3
> 2
> 1
> 8
> 6

##### 同步代码块

于是给这段代码的某个位置加锁

使用同步代码块，不应该将整个while循环放入同步代码块，这样变成了单线程

使用synchronized (this) {}包裹while中的内容，使其在同一时刻只被一个线程执行

代码做如下修改：

```java
public class Task implements Runnable {

    private int quantity = 10;

    @Override
    public void run() {
        while (quantity > 0) {
            synchronized (this) {
                System.out.println(quantity);
                --quantity;
            }
        }
    }
}
```

输出：

> 10
> 9
> 8
> 7
> 6
> 5
> 4
> 3
> 2
> 1
> 0
> -1

发现多卖出了0号票和-1号票

原因是三个线程判断完while条件后都进入等待同步锁，最终都会执行同步代码块中的内容

解决方法：

在同步代码块中再加一层判断

```java
public class Task implements Runnable {

    private int quantity = 10;

    @Override
    public void run() {
        while (quantity > 0) {
            synchronized (this) {
                if (quantity > 0) {
                    System.out.println(quantity);
                    --quantity;
                }
            }
        }
    }
}
```

##### 同步方法

```java
public class Task implements Runnable {

    private int quantity = 10;

    @Override
    public void run() {
        while (quantity > 0) {
            ticketing();
        }
    }

    private synchronized void ticketing() {
        if (quantity > 0) {
            System.out.println(quantity);
            --quantity;
        }
    }
}
```

输出：

> 10
> 9
> 8
> 7
> 6
> 5
> 4
> 3
> 2
> 1



#### 同步锁的类型

##### 概念

同步锁是为了保证每个线程都能正常执行原子不可更改操作，同步监听对象/同步锁/同步监听器/互斥锁的一个标记锁

能成为同步锁的类型：

|   类型   |                             示例                             |
| :------: | :----------------------------------------------------------: |
| 对象类型 | 1. Student student = new Student();<br />2. Object obj = new Object();<br />3. this |
|  类类型  |            1. Student.class<br />2. Object.class             |

##### 代码

对象类型

```java
Student student = new Student();
synchronized (student) {

}
```

```java
Object obj = new Object();
synchronized (obj) {

}
```

```java
synchronized (this) {

}
```

类类型

```java
synchronized (Student.class) {

}
```

这段代码展示了同步代码块的this锁，this锁指的就是Student student = new Student()中的student

```java
class Student {
    private String name;
    
    public void setName(String name) {
        synchronized (this) {
            this.name = name;
        }
    }
}
```

这段代码展示了同步方法的this锁

```java
class Student {
    private String name;

    public synchronized void setName(String name) {
        this.name = name;
    }
}
```

静态同步方法的类类型锁

```java
class Student {
    private static String name;

    public static synchronized void setName(String name) {
        Student.name = name;
    }
}
```

##### 总结

|   同步类型   |         锁类型         |
| :----------: | :--------------------: |
|  同步代码块  | 对象类型、this、类类型 |
|   同步方法   |          this          |
| 静态同步方法 |         类类型         |



#### 同一把锁的争夺

##### 同一把锁

创建一个争夺同一把锁的Task

```java
public class Task implements Runnable {

    private boolean flag = true;

    public void setFlag(boolean flag) {
        this.flag = flag;
    }

    @Override
    public void run() {
        if (flag) {
            synchronized (Task.class) {	// 这里
                try {
                    Thread.sleep(3000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(Thread.currentThread().getName() + "醒了");
            }
        } else {
            synchronized (Task.class) {	// 这里
                System.out.println(Thread.currentThread().getName() + "六百六十六");
            }
        }
    }
}
```

主线程里创建两个线程，先启动线程1，过1秒后改变标记启动线程2

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        Thread thread1 = new Thread(task);
        Thread thread2 = new Thread(task);
        thread1.start();
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        task.setFlag(false);
        thread2.start();
    }
}
```

输出如下：

> （过了3秒同时输出）
>
> Thread-0醒了
> Thread-1六百六十六

thread1先进入同步代码块睡了3秒，睡的过程中不释放同步锁，这时过去1秒thread2也要进入相同同步锁的代码块，由于锁没释放，thread2只能等thread1睡醒后再进入执行。thread1睡醒后thread2得以执行，二者几乎同时输出

##### 不同锁

把Task代码中else中的锁换成主线程锁，再次运行

```java
public class Task implements Runnable {

    private boolean flag = true;

    public void setFlag(boolean flag) {
        this.flag = flag;
    }

    @Override
    public void run() {
        if (flag) {
            synchronized (Task.class) {
                try {
                    Thread.sleep(3000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(Thread.currentThread().getName() + "醒了");
            }
        } else {
            synchronized (Main.class) {	// 改了这里
                System.out.println(Thread.currentThread().getName() + "六百六十六");
            }
        }
    }
}
```

输出如下：

> （过了1秒）
>
> Thread-1六百六十六
>
> （又过了2秒）
>
> Thread-0醒了

由于thread2不和thread1竞争锁，而是和主线程竞争锁，所以thread2等主线程睡完1秒就可以进入同步代码块执行



#### 死锁

##### 概念

死锁是指**两个或两个以上的线程**在执行过程中，由于**竞争资源**或者由于彼此通信而**造成的一种阻塞**的现象，若无外力作用，它们都将无法推进下去。此时称系统处于死锁状态或系统产生了死锁，这些永远在互相等待的线程称为死锁线程。

##### 产生死锁的四个条件

1. 两个或两个以上的线程
2. 两个或两个以上的锁
3. 两个或两个以上的线程持有不同的锁
4. 持有不同锁的线程争夺对方的锁

##### 代码

下面代码展示了两个线程LockA和LockB，分别持有锁printA()和printB()，在printA()中争夺printB()锁，在printB()中争夺printA()锁

```java
public class LockA extends Thread {

    @Override
    public void run() {
        printA();
    }

    public static synchronized void printA() {
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("A");
        LockB.printB();
    }
}
```

```java
public class LockB extends Thread {

    @Override
    public void run() {
        printB();
    }

    public static synchronized void printB() {
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("B");
        LockA.printA();
    }
}
```

启动主线程

```java
public class Main {
    public static void main(String[] args) {
        LockA lockA = new LockA();
        LockB lockB = new LockB();
        lockA.start();
        lockB.start();
    }
}
```

输出：

> A
> B
>
> （程序一直运行，但打印不出任何东西）



#### 等待唤醒机制

##### wait

抛出异常：
`IllegalMonitorStateException` – if the current thread is not the owner of the object's monitor（当前线程的Object对象没拿到锁）
`InterruptedException` – if any thread interrupted the current thread before or while the current thread was waiting. The interrupted status of the current thread is cleared when this exception is thrown.（当前线程被中断）

```java
public final void wait() throws InterruptedException {
    wait(0L);
}
```

下面线程持有this锁，并且进入等待状态。因为没有被唤醒，所以一直等待，没有输出

```java
public class Task implements Runnable {
    @Override
    public void run() {
        synchronized (this) {
            try {
                this.wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println("欧玛激励曼波哇夏曼波");
        }
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        Thread thread = new Thread(task);
        thread.start();
    }
}
```

##### notify

能够唤醒单个线程，要求也是Object对象必须持有锁且没有被中断

这段代码主线程休眠了1秒，随后持有task的锁，并将task线程唤醒

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        Thread thread = new Thread(task);
        thread.start();

        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        synchronized (task) {
            task.notify();
        }
    }
}
```

输出：

> （等待1秒）
>
> 欧玛激励曼波哇夏曼波

把线程变成3个：

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        Thread thread1 = new Thread(task);
        Thread thread2 = new Thread(task);
        Thread thread3 = new Thread(task);
        thread1.start();
        thread2.start();
        thread3.start();

        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        synchronized (task) {
            task.notify();
        }
    }
}
```

由于第一个线程被唤醒执行结束后释放锁，第二个线程持有锁并等待，所以只会打印一句话，程序始终等待

##### notifyAll

唤醒所有线程

修改最后一句代码，让所有线程结束等待

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        Thread thread1 = new Thread(task);
        Thread thread2 = new Thread(task);
        Thread thread3 = new Thread(task);
        thread1.start();
        thread2.start();
        thread3.start();

        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        synchronized (task) {
            task.notifyAll();
        }
    }
}
```

最后所有线程都有输出

##### 总结

|           方法名称            |                      作用                       |
| :---------------------------: | :---------------------------------------------: |
|             wait              |                 使当前线程等待                  |
|      wait(long timeout)       |    使当前线程等待，经过timeout时间后自动唤醒    |
| wait(long timeout, int nanos) | 使当前线程等待，经过timeout+nanos时间后自动唤醒 |
|            notify             |                  唤醒单个线程                   |
|           notifyAll           |                  唤醒所有线程                   |



#### wait与sleep区别

|                |       sleep        |          wait          |
| :------------: | :----------------: | :--------------------: |
|      位置      |      Thread类      |        Object类        |
| 当前线程拥有锁 |       不需要       |          需要          |
|    手动唤醒    |       不支持       |   notify、notifyAll    |
|    自动唤醒    | sleep(long millis) |   wait(long timeout)   |
|      中断      |     interrupt      |       interrupt        |
|     释放锁     |         否         |           是           |
|    线程状态    |   TIMED_WAITING    | WAITING、TIMED_WAITING |



#### 线程间通讯

##### 生产者消费者例子

消费者线程先等待，生产者线程生产出数据后唤醒消费者线程，消费者线程让生产者线程等待，随后开始消费数据，结束后唤醒生产者线程

需要编写三个类，分别是数据类、生产者和消费者

```java
public class Data {
    private String message;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
```

```java
public class Producer implements Runnable {

    private final Data data;

    public Producer(Data data) {
        this.data = data;
    }

    @Override
    public void run() {
        int i = 0;
        while (true) {
            synchronized (data) {
                if (data.getMessage() == null) {
                    data.setMessage("Message " + i++);
                    System.out.println("Produced " + data.getMessage());
                }
                data.notify();
                try {
                    data.wait();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
```

```java
public class Consumer implements Runnable {

    private final Data data;

    public Consumer(Data data) {
        this.data = data;
    }

    @Override
    public void run() {
        while (true) {
            synchronized (data) {
                if (data.getMessage() != null) {
                    System.out.println("Consumed " + data.getMessage());
                    data.setMessage(null);
                }
                data.notify();
                try {
                    data.wait();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        Data data = new Data();
        Producer producer = new Producer(data);
        Consumer consumer = new Consumer(data);
        Thread producerThread = new Thread(producer);
        Thread consumerThread = new Thread(consumer);
        producerThread.start();
        consumerThread.start();
    }
}
```

部分输出：

> Produced Message 173046
> Consumed Message 173046
> Produced Message 173047
> Consumed Message 173047
> Produced Message 173048
> Consumed Message 173048



#### 显式锁Lock

Lock是一个接口对象

```java
public interface Lock
```

|                            获取锁                            |    释放锁     |                  中断锁上阻塞的线程                  |   条件（wait、notify）   |
| :----------------------------------------------------------: | :-----------: | :--------------------------------------------------: | :----------------------: |
|                         void lock()                          | void unlock() | void lockInterruptibly() throws InterruptedException | Condition newCondition() |
|                      boolean tryLock()                       |               |                                                      |                          |
| boolean tryLock(long time, TimeUnit unit) throws InterruptedException |               |                                                      |                          |

Lock有几种常用的子类：

* `ReentrantLock`：可重入锁
* `ReentrantReadWriteLock.ReadLock`：读锁
* `ReentrantReadWriteLock.WriteLock`：写锁

用显式锁同步的一个例子

```java
public class Task implements Runnable {

    private Lock lock = new ReentrantLock();

    @Override
    public void run() {
        lock.lock();
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println(Thread.currentThread().getName() + "醒了");
        lock.unlock();
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        Thread thread1 = new Thread(task);
        Thread thread2 = new Thread(task);
        thread1.start();
        thread2.start();
    }
}
```

输出：

> Thread-0醒了
> Thread-1醒了



#### 非阻塞式获取锁

|                           方法名称                           |                             作用                             |
| :----------------------------------------------------------: | :----------------------------------------------------------: |
|                      boolean tryLock()                       |        尝试获取锁，如果锁可用返回true，否则返回false         |
| boolean tryLock(long time, TimeUnit unit) throws InterruptedException | 尝试定时获取锁，在指定时间内如果锁可用返回true，否则返回false |

格式：

```java
if (lock.tryLock()) {
    try {
        // 同步代码
    } finally {
        lock.unlock();
    }
} else {
    // 未获取锁的逻辑
}
```

无参数tryLock使用示例：

```java
public class Task implements Runnable {

    private Lock lock = new ReentrantLock();

    @Override
    public void run() {
        if (lock.tryLock()) {
            try {
                Thread.sleep(1000);
                System.out.println(Thread.currentThread().getName() + "醒了");
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                lock.unlock();
            }
        } else {
            System.out.println(Thread.currentThread().getName() + "没有得到锁");
        }
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start();
        t2.start();
    }
}
```

输出：

> Thread-1没有得到锁
> Thread-0醒了

有参数tryLock使用示例：

```java
public class Task implements Runnable {

    private Lock lock = new ReentrantLock();

    @Override
    public void run() {
        try {
            if (lock.tryLock(3, TimeUnit.SECONDS)) {
                try {
                    Thread.sleep(1000);
                    System.out.println(Thread.currentThread().getName() + "醒了");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    lock.unlock();
                }
            } else {
                System.out.println(Thread.currentThread().getName() + "没有得到锁");
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

由于在3秒内拿到了锁，所以两个线程都正常打印

> Thread-1醒了
> Thread-0醒了



#### 中断等待锁的线程

|       获取锁的方式       | 是否可中断等待锁的线程 |
| :----------------------: | :--------------------: |
|       synchronized       |        不可中断        |
|       Lock#lock()        |        不可中断        |
| Lock#lockInterruptibly() |         可中断         |

##### 不可中断

两个线程的同步代码块中，休眠3秒，主线程中休眠1秒

下面两种代码是一样的

```java
public class Task implements Runnable {
    @Override
    public void run() {
        synchronized (this) {
            try {
                Thread.sleep(3000);
                System.out.println(Thread.currentThread().getName());
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
```

```java
public class Task implements Runnable {

    private Lock lock = new ReentrantLock();

    @Override
    public void run() {
        lock.lock();
        try {
            Thread.sleep(3000);
            System.out.println(Thread.currentThread().getName());
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
    }
}
```

主线程

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        Thread thread0 = new Thread(task);
        Thread thread1 = new Thread(task);
        thread0.start();
        thread1.start();
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        thread1.interrupt();
    }
}
```

输出结果：

> Thread-0
> java.lang.InterruptedException: sleep interrupted
> 	at java.base/java.lang.Thread.sleep(Native Method)
> 	at com.neko.juc18.Task.run(Task.java:15)
> 	at java.base/java.lang.Thread.run(Thread.java:833)

由于thread1是等待锁的线程，主线程1秒过后中断thread1，因为这两种获取锁的方式不可中断，所以报错

##### 可中断

修改上锁的类型，变成可中断上锁

```java
public class Task implements Runnable {

    private Lock lock = new ReentrantLock();

    @Override
    public void run() {
        try {
            lock.lockInterruptibly();
        } catch (InterruptedException e) {
            System.out.println(Thread.currentThread().getName() + "被中断");
            return;
        }
        try {
            Thread.sleep(3000);
            System.out.println(Thread.currentThread().getName());
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
    }
}
```

主线程保持不变，输出如下：

> Thread-1被中断
> Thread-0



#### Lock锁的等待唤醒机制

##### 概要

Lock锁通过Condition实现了一套等待唤醒机制

Condition是一个接口

```java
public interface Condition {
	void await() throws InterruptedException;
	void awaitUninterruptibly();
	long awaitNanos(long nanosTimeout) throws InterruptedException;
	boolean await(long time, TimeUnit unit) throws InterruptedException;
	boolean awaitUntil(Date deadline) throws InterruptedException;
	void signal();
	void signalAll();
}
```

有如下方法：

|            方法名称             |                           作用                           |
| :-----------------------------: | :------------------------------------------------------: |
|             await()             |           使当前线程等待，直到唤醒或被中断为止           |
|     awaitUninterruptibly()      |               使当前线程等待，直到唤醒为止               |
|  awaitNanos(long nanosTimeout)  | 使当前线程等待，直到唤醒或被中断或经过指定的等待时间为止 |
| await(long time, TimeUnit unit) | 使当前线程等待，直到唤醒或被中断或经过指定的等待时间为止 |
|    awaitUntil(Date deadline)    | 使当前线程等待，直到唤醒或被中断或经过指定的等待时间为止 |
|            signal()             |                     唤醒一个等待线程                     |
|           signalAll()           |                    唤醒所有等待的线程                    |

synchronized与Condition对比：

|         synchronized          |            Condition            |
| :---------------------------: | :-----------------------------: |
|            wait()             |             await()             |
|                               |     awaitUninterruptibly()      |
|      wait(long timeout)       |  awaitNanos(long nanosTimeout)  |
| wait(long timeout, int nanos) | await(long time, TimeUnit unit) |
|                               |    awaitUntil(Date deadline)    |
|           notify()            |            signal()             |
|          notifyAll()          |           signalAll()           |

##### await

任务线程中声明一个锁和一个Condition，通过构造方法传参的方式传进来

```java
public class Task implements Runnable {
    private Lock lock;
    private Condition condition;

    public Task(Lock lock, Condition condition) {
        this.lock = lock;
        this.condition = condition;
    }

    @Override
    public void run() {
        lock.lock();
        try {
            condition.await();
            System.out.println(Thread.currentThread().getName());
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
    }
}
```

主线程

```java
public class Main {
    public static void main(String[] args) {
        Lock lock = new ReentrantLock();
        Condition condition = lock.newCondition();
        Task task = new Task(lock, condition);
        Thread thread = new Thread(task);
        thread.start();
    }
}
```

执行时，线程进入等待，没有输出，程序始终运行

##### signal

唤醒单个正在等待的线程

此时任务线程中声明式的锁起作用，从外面控制锁，然后传入线程中

```java
public class Main {
    public static void main(String[] args) {
        Lock lock = new ReentrantLock();
        Condition condition = lock.newCondition();
        Task task = new Task(lock, condition);
        Thread thread = new Thread(task);
        thread.start();

        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        lock.lock();
        condition.signal();
        lock.unlock();
    }
}
```

1秒后唤醒线程，输出Thread-0

##### signalAll

唤醒所有等待的线程

```java
public class Main {
    public static void main(String[] args) {
        Lock lock = new ReentrantLock();
        Condition condition = lock.newCondition();
        Task task = new Task(lock, condition);
        Thread thread0 = new Thread(task);
        Thread thread1 = new Thread(task);
        Thread thread2 = new Thread(task);
        thread0.start();
        thread1.start();
        thread2.start();

        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        lock.lock();
        condition.signalAll();
        lock.unlock();
    }
}
```

输出：

> Thread-0
> Thread-1
> Thread-2



#### 生产者与消费者

1. 数据类
2. 生产者
3. 消费者

##### 2个Condition的原因

* 管理线程的等待与唤醒更方便
* 代码逻辑更清晰

每个Condition分管自己的那些线程，各司其职，清晰明了

##### 代码

数据类

```java
public class Data {

    private Lock lock = new ReentrantLock();
    private Condition producerCondition = lock.newCondition();
    private Condition consumerCondition = lock.newCondition();
    private String message;

    public String getMessage() throws InterruptedException {
        lock.lock();
        try {
            while (this.message == null) {
                consumerCondition.await();
            }
            producerCondition.signalAll();
            return message;
        } finally {
            this.message = null;
            lock.unlock();
        }
    }

    public void setMessage(String message) throws InterruptedException {
        lock.lock();
        try {
            while (this.message != null) {
                producerCondition.await();
            }
            this.message = message;
            System.out.println("Producer: " + this.message);
            consumerCondition.signalAll();
        } finally {
            lock.unlock();
        }
    }
}
```

生产者

```java
public class Producer implements Runnable {

    private final Data data;

    public Producer(Data data) {
        this.data = data;
    }

    @Override
    public void run() {
        int i = 0;
        while (true) {
            try {
                data.setMessage("Message " + i++);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
```

消费者

```java
public class Consumer implements Runnable {

    private final Data data;

    public Consumer(Data data) {
        this.data = data;
    }

    @Override
    public void run() {
        while (true) {
            try {
                System.out.println("Consumer: " + data.getMessage());
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
```

输出：

> Producer: Message 240914
> Consumer: Message 240914
> Producer: Message 240915
> Consumer: Message 240915
> Producer: Message 240916
> Consumer: Message 240916



#### 可重入锁与不可重入锁

|   锁类型   |                            锁对象                            |
| :--------: | :----------------------------------------------------------: |
|  可重入锁  | synchronized<br />ReentrantLock<br />ReentrantReadWriteLock.ReadLock<br />ReentrantReadWriteLock.WriteLock |
| 不可重入锁 |                            自定义                            |

##### 可重入锁：synchronized

类

```java
public class Main {
    public static void main(String[] args) {
        synchronized (Main.class) {
            System.out.println("第一次获取锁");
            synchronized (Main.class) {
                System.out.println("第二次获取锁");
            }
        }
    }
}
```

输出：

> 第一次获取锁
> 第二次获取锁

静态同步方法

```java
public class Main {
    public static void main(String[] args) {
        printA();
    }

    public static synchronized void printA() {
        System.out.println("第一次获取锁");
        printB();
    }

    public static synchronized void printB() {
        System.out.println("第二次获取锁");
    }
}
```

输出：

> 第一次获取锁
> 第二次获取锁

##### 可重入锁：ReentrantLock

```java
public class Main {
    public static void main(String[] args) {
        Lock lock = new ReentrantLock();
        lock.lock();
        try {
            System.out.println("第一次获取锁");
            lock.lock();
            try {
                System.out.println("第二次获取锁");
            } finally {
                lock.unlock();
            }
        } finally {
            lock.unlock();
        }
    }
}
```

输出：

> 第一次获取锁
> 第二次获取锁

##### 不可重入锁

* 实现Lock接口
* 绑定已获取锁的线程
* 实现获取锁的方法
* 实现释放锁的方法

自定义一个不可重入锁类

```java
public class UnReentrantLock implements Lock {

    private Thread thread;

    @Override
    public void lock() {
        synchronized (this) {
            while (thread != null) {
                try {
                    wait();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            this.thread = Thread.currentThread();
        }
    }

    @Override
    public void lockInterruptibly() throws InterruptedException {

    }

    @Override
    public boolean tryLock() {
        return false;
    }

    @Override
    public boolean tryLock(long time, TimeUnit unit) throws InterruptedException {
        return false;
    }

    @Override
    public void unlock() {
        synchronized (this) {
            if (thread != Thread.currentThread()) {
                return;
            }
            thread = null;
            notifyAll();
        }
    }

    @Override
    public Condition newCondition() {
        return null;
    }
}
```

主线程中把ReentrantLock改成UnReentrantLock

```java
public class Main {
    public static void main(String[] args) {
        Lock lock = new UnReentrantLock();
        lock.lock();
        try {
            System.out.println("第一次获取锁");
            lock.lock();
            try {
                System.out.println("第二次获取锁");
            } finally {
                lock.unlock();
            }
        } finally {
            lock.unlock();
        }
    }
}
```

输出第一次获取锁后，不再输出，由于绑定的thread一直不是null，导致死循环，程序始终无法结束



#### 公平锁与非公平锁

##### 概念

* 公平：每个线程获取锁的机会是平等的
* 非公平：每个线程获取锁的机会是不平等的

|  锁类型  |              描述              |                            锁对象                            |
| :------: | :----------------------------: | :----------------------------------------------------------: |
|  公平锁  |  每个线程获取锁的机会是平等的  | new ReentrantLock(true)<br />new ReentrantReadWriteLock(true) |
| 非公平锁 | 每个线程获取锁的机会是不平等的 | synchronized<br />new ReentrantLock(false)<br />new ReentrantReadWriteLock(false) |

##### 非公平锁synchronized

无限循环获取锁并输出当前线程名称

```java
public class Task implements Runnable {
    @Override
    public void run() {
        while (true) {
            synchronized (this) {
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(Thread.currentThread().getName());
            }
        }
    }
}
```

主线程

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        Thread thread0 = new Thread(task);
        Thread thread1 = new Thread(task);
        Thread thread2 = new Thread(task);
        thread0.start();
        thread1.start();
        thread2.start();
    }
}
```

输出：

> Thread-0
> Thread-0
> Thread-0
> Thread-0
> Thread-0
> Thread-0

##### 非公平锁ReentrantLock

修改一下上面的synchronized程序

```java
public class Task implements Runnable {

    private Lock lock = new ReentrantLock();

    @Override
    public void run() {
        while (true) {
            lock.lock();
            try {
                Thread.sleep(1000);
                System.out.println(Thread.currentThread().getName());
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                lock.unlock();
            }
        }
    }
}
```

主线程保持不变，输出：

> Thread-0
> Thread-0
> Thread-0
> Thread-0
> Thread-0
> Thread-0

##### 公平锁ReentrantLock

只需要在ReentrantLock的构造方法中传入true，就变成了公平锁

```java
public class Task implements Runnable {

    private Lock lock = new ReentrantLock(true);

    @Override
    public void run() {
        while (true) {
            lock.lock();
            try {
                Thread.sleep(1000);
                System.out.println(Thread.currentThread().getName());
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                lock.unlock();
            }
        }
    }
}
```

输出：

> Thread-0
> Thread-1
> Thread-2
> Thread-0
> Thread-1
> Thread-2

##### 判断锁是否公平isFair

```java
public class Main {
    public static void main(String[] args) {
        ReentrantLock lock = new ReentrantLock();
        System.out.println(lock.isFair());
    }
}
```

输出：

> false

```java
public class Main {
    public static void main(String[] args) {
        ReentrantLock lock = new ReentrantLock(true);
        System.out.println(lock.isFair());
    }
}
```

输出：

> true



#### 读锁与写锁

##### ReentrantReadWriteLock

| 锁类型 |         描述         | 是否独占 |              锁对象              |
| :----: | :------------------: | :------: | :------------------------------: |
|  读锁  | 用于读取操作的同步锁 |   共享   | ReentrantReadWriteLock.ReadLock  |
|  写锁  | 用于写入操作的同步锁 |   独占   | ReentrantReadWriteLock.WriteLock |

下面是读锁与写锁的UML类图

ReentrantReadWriteLock实现了ReadWriteLock接口，ReentrantReadWriteLock里面有两个静态内部类ReadLock和WriteLock，这两个静态内部类实现了Lock接口

![ReadWriteLock](../../../../images/posts/2025/08/multithread/pics/ReadWriteLock.png)

##### ReadLock

创建读写锁和读锁，用读锁加锁

```java
public class Task implements Runnable {

    // 读写锁
    private ReadWriteLock readWriteLock = new ReentrantReadWriteLock(true);
    // 读锁
    private Lock readLock = this.readWriteLock.readLock();

    @Override
    public void run() {
        this.readLock.lock();
        try {
            Thread.sleep(1000);
            System.out.println(Thread.currentThread().getName());
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            this.readLock.unlock();
        }
    }
}
```

主线程

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        Thread thread0 = new Thread(task);
        Thread thread1 = new Thread(task);
        Thread thread2 = new Thread(task);
        thread0.start();
        thread1.start();
        thread2.start();
    }
}
```

输出如下，说明三个线程同时拿到读锁，是共享的

> （同时输出）
>
> Thread-1
> Thread-2
> Thread-0

##### WriteLock

把读锁换成写锁

```java
public class Task implements Runnable {

    // 读写锁
    private ReadWriteLock readWriteLock = new ReentrantReadWriteLock(true);
    // 写锁
    private Lock writeLock = this.readWriteLock.writeLock();

    @Override
    public void run() {
        this.writeLock.lock();
        try {
            Thread.sleep(1000);
            System.out.println(Thread.currentThread().getName());
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            this.writeLock.unlock();
        }
    }
}
```

输出如下，说明写锁是独占的

> （1秒后）
>
> Thread-0
>
> （1秒后）
>
> Thread-1
>
> （1秒后）
>
> Thread-2

##### 高并发容器

一个多线程并发读写的示例

* 存储数据，写入操作，WriteLock
* 获取数据，读取操作，ReadLock

首先写一个容器类，定义一个哈希表和一个读锁一个写锁。读锁负责两个方法，get方法根据键获取值，getAllKeys方法获取所有键；写锁负责两个方法，put方法根据键写入值，clear方法清空哈希表

```java
public class Container {
    // key-value容器
    private final Map<String, Object> m = new HashMap<>();
    // 读写锁
    private final ReadWriteLock rwlock = new ReentrantReadWriteLock(true);
    // 读锁
    private final Lock rlock = rwlock.readLock();
    // 写锁
    private final Lock wlock = rwlock.writeLock();

    public Object get(String key) {
        rlock.lock();
        try {
            return m.get(key);
        } finally {
            rlock.unlock();
        }
    }

    public String[] getAllKeys() {
        rlock.lock();
        try {
            return m.keySet().toArray(new String[0]);
        } finally {
            rlock.unlock();
        }
    }

    public Object put(String key, Object value) {
        wlock.lock();
        try {
            return m.put(key, value);
        } finally {
            wlock.unlock();
        }
    }

    public void clear() {
        wlock.lock();
        try {
            m.clear();
        } finally {
            wlock.unlock();
        }
    }
}
```

写任务

```java
public class WriteTask implements Runnable {

    private Container container;

    public WriteTask(Container container) {
        this.container = container;
    }

    @Override
    public void run() {
        int i = 0;
        while (true) {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            String name = Thread.currentThread().getName();
            container.put("真没见过黑手", name + "===" + i++);
        }
    }
}
```

读任务

```java
public class ReadTask implements Runnable {

    private Container container;

    public ReadTask(Container container) {
        this.container = container;
    }

    @Override
    public void run() {
        while (true) {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            String[] keys = container.getAllKeys();
            for (String key : keys) {
                Object value = container.get(key);
                System.out.println(key + ": " + value);
            }
        }
    }
}
```

主线程

```java
public class Main {
    public static void main(String[] args) {
        Container container = new Container();
        WriteTask writeTask = new WriteTask(container);
        ReadTask readTask = new ReadTask(container);
        Thread writeThread0 = new Thread(writeTask);
        Thread writeThread1 = new Thread(writeTask);
        Thread writeThread2 = new Thread(writeTask);
        Thread readThread0 = new Thread(readTask);
        Thread readThread1 = new Thread(readTask);
        Thread readThread2 = new Thread(readTask);
        writeThread0.start();
        writeThread1.start();
        writeThread2.start();
        readThread0.start();
        readThread1.start();
        readThread2.start();
    }
}
```

输出：

> （1秒）
>
> 真没见过黑手: Thread-2===0
> 真没见过黑手: Thread-2===0
> 真没见过黑手: Thread-2===0
>
> （1秒）
>
> 真没见过黑手: Thread-1===1
> 真没见过黑手: Thread-1===1
> 真没见过黑手: Thread-1===1
>
> （1秒）
>
> 真没见过黑手: Thread-1===2
> 真没见过黑手: Thread-1===2
> 真没见过黑手: Thread-1===2
>
> （1秒）
>
> 真没见过黑手: Thread-1===3
> 真没见过黑手: Thread-1===3
> 真没见过黑手: Thread-1===3
>
> （1秒）
>
> 真没见过黑手: Thread-1===4
> 真没见过黑手: Thread-1===4
> 真没见过黑手: Thread-1===4
>
> （1秒）
>
> 真没见过黑手: Thread-2===5
> 真没见过黑手: Thread-2===5
> 真没见过黑手: Thread-2===5
>
> （1秒）
>
> 真没见过黑手: Thread-0===6
> 真没见过黑手: Thread-0===6
>
> （1秒）
>
> 真没见过黑手: Thread-2===7
> 真没见过黑手: Thread-2===7
> 真没见过黑手: Thread-2===7
> 真没见过黑手: Thread-2===7
>
> （1秒）
>
> 真没见过黑手: Thread-0===8
> 真没见过黑手: Thread-0===8
> 真没见过黑手: Thread-0===8
>
> （1秒）
>
> 真没见过黑手: Thread-2===9
> 真没见过黑手: Thread-2===9
> 真没见过黑手: Thread-2===9
>
> （1秒）
>
> 真没见过黑手: Thread-0===10
> 真没见过黑手: Thread-0===10
>
> （1秒）
>
> 真没见过黑手: Thread-2===11
> 真没见过黑手: Thread-2===11
> 真没见过黑手: Thread-2===11
>
> （1秒）
>
> 真没见过黑手: Thread-2===12
> 真没见过黑手: Thread-2===12
> 真没见过黑手: Thread-2===12
> 真没见过黑手: Thread-2===12
>
> （1秒）
>
> 真没见过黑手: Thread-0===13
> 真没见过黑手: Thread-0===13
>
> （1秒）
>
> 真没见过黑手: Thread-1===14
> 真没见过黑手: Thread-1===14
> 真没见过黑手: Thread-1===14



#### synchronized与Lock区别

|                  |                         synchronized                         |                             Lock                             |
| :--------------: | :----------------------------------------------------------: | :----------------------------------------------------------: |
|       类型       |                            关键字                            |                             接口                             |
|       格式       | synchronized (同步锁) {}<br />访问修饰符 synchronized 返回值类型 方法名 (参数列表) {}<br />访问修饰符 static synchronized 返回值类型 方法名 (参数列表) {} | Lock lock = new ...;<br />lock.lock();<br />try {<br />} finally {<br />lock.unlock();<br />} |
|   释放锁的方式   |                           隐式自动                           |                           显式手动                           |
|       别名       |                            隐式锁                            |                            显式锁                            |
| 连续释放锁的方式 |                          按顺序依次                          |                           自由安排                           |
|      公平锁      |                           非公平锁                           |                       公平锁、非公平锁                       |
|      读写锁      |                              无                              | ReentrantReadWriteLock.ReadLock<br />ReentrantReadWriteLock.WriteLock |



#### 等待唤醒工具类

##### LockSupport

|                    方法名                     |                          描述                          |
| :-------------------------------------------: | :----------------------------------------------------: |
|                  void park()                  |             使当前线程等待，直到唤醒或超时             |
|           void park(Object blocker)           |      使当前线程等待，并指定同步锁，直到唤醒或超时      |
|          void parkNanos(long nanos)           |     使当前线程等待，并指定等待时间，直到唤醒或超时     |
|  void parkNanos(Object blocker, long nanos)   | 使当前线程等待，并指定同步锁和等待时间，直到唤醒或超时 |
|         void parkUntil(long deadline)         |     使当前线程等待，并指定等待时间，直到唤醒或超时     |
| void parkUntil(Object blocker, long deadline) | 使当前线程等待，并指定同步锁和等待时间，直到唤醒或超时 |
|          void unpark(Thread thread)           |                      唤醒指定线程                      |
|          Object getBlocker(Thread t)          |                  获取指定线程的同步锁                  |

##### 演示

写一个任务线程，让自身等待

```java
public class Task implements Runnable {
    @Override
    public void run() {
        System.out.println("before");
        LockSupport.park();
        System.out.println("after");
    }
}
```

主线程

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        Thread thread = new Thread(task);
        thread.start();
    }
}
```

输出before，然后程序始终无法结束，一直等待

修改主线程，3秒后唤醒任务线程

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        Thread thread = new Thread(task);
        thread.start();

        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        LockSupport.unpark(thread);
    }
}
```

输出：

> before
>
> （3秒后）
>
> after

##### 互斥锁

* 锁标志
* 等待队列
* 处理线程中断

这是一段先进先出的互斥锁，由原子标记和一个队列组成。上锁时，对等待锁的线程自旋，只有线程处于队列头且成功获取锁时上锁成功，标记中断延迟处理，线程可在等待期间响应中断请求。

```java
public class FIFOMutex {
    // 锁标志
    private final AtomicBoolean locked = new AtomicBoolean(false);
    // 线程等待队列
    private final Queue<Thread> waiters = new ConcurrentLinkedQueue<>();

    // 获取锁
    public void lock() {
        // 中断标记
        boolean wasInterrupted = false;
        Thread current = Thread.currentThread();
        waiters.add(current);

        // 当前线程不是队列中第一个或没有获取到锁
        while (waiters.peek() != current || !locked.compareAndSet(false, true)) {
            // 使当前线程等待
            LockSupport.park(this);
            // 被唤醒后，判断当前线程是否被中断并清除中断状态
            if (Thread.interrupted()) {
                // 记录当前线程被中断
                // 但是在等待时忽略中断
                // 这是为了避免在等待队列中忽略中断请求，而是延迟处理
                wasInterrupted = true;
            }
        }

        // 获取锁之后将当前线程移出队列
        waiters.remove();
        // 当前线程被中断时
        if (wasInterrupted) {
            // 在退出时重新声明中断状态
            current.interrupt();
        }
    }

    // 释放锁
    public void unlock() {
        // 将锁标志设置为false
        locked.set(false);
        // 唤醒指定线程
        LockSupport.unpark(waiters.peek());
    }
}
```

任务线程，上锁然后睡3秒

```java
public class Task implements Runnable {

    private final FIFOMutex lock = new FIFOMutex();

    @Override
    public void run() {
        lock.lock();
        try {
            Thread.sleep(3000);
            System.out.println(Thread.currentThread().getName());
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
    }
}
```

主线程

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        Thread t3 = new Thread(task);
        Thread t4 = new Thread(task);
        t1.start();
        t2.start();
        t3.start();
        t4.start();
    }
}
```

输出：

> Thread-1
>
> （3秒）
>
> Thread-2
>
> （3秒）
>
> Thread-3
>
> （3秒）
>
> Thread-0



#### 读写锁互斥

|      |  读锁  | 写锁 |
| :--: | :----: | :--: |
| 读锁 | 不互斥 | 互斥 |
| 写锁 |  互斥  | 互斥 |

##### 读读不互斥

任务线程

```java
public class Task implements Runnable {

    private final ReadWriteLock rwl = new ReentrantReadWriteLock();

    private final Lock r = rwl.readLock();

    @Override
    public void run() {
        r.lock();
        try {
            Thread.sleep(3000);
            System.out.println(Thread.currentThread().getName());
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            r.unlock();
        }
    }
}
```

主线程

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        Thread thread0 = new Thread(task);
        Thread thread1 = new Thread(task);
        thread0.start();
        thread1.start();
    }
}
```

同时输出：

>Thread-1
>Thread-0

##### 写写互斥

修改任务线程中的读锁为写锁

```java
public class Task implements Runnable {

    private final ReadWriteLock rwl = new ReentrantReadWriteLock();

    private final Lock w = rwl.writeLock();

    @Override
    public void run() {
        w.lock();
        try {
            Thread.sleep(3000);
            System.out.println(Thread.currentThread().getName());
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            w.unlock();
        }
    }
}
```

主线程不变，输出：

> （3秒后）
>
> Thread-0
>
> （3秒后）
>
> Thread-1

##### 读写互斥

用flag切换读锁和写锁

```java
public class Task implements Runnable {

    private final ReadWriteLock rwl = new ReentrantReadWriteLock();

    private final Lock r = rwl.readLock();

    private final Lock w = rwl.writeLock();

    public boolean flag = true;

    @Override
    public void run() {
        if (flag) {
            r.lock();
            try {
                System.out.println(Thread.currentThread().getName());
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                r.unlock();
            }
        } else {
            w.lock();
            try {
                System.out.println(Thread.currentThread().getName());
            } finally {
                w.unlock();
            }
        }
    }
}
```

主线程休眠1秒后启动写线程，一开始是读锁先拿到，如果等3秒后拿到写锁，说明读写锁互斥

输出：

> （立刻）
>
> Thread-0
>
> （3秒后）
>
> Thread-1



#### 升级版读写锁

##### 线程饥饿

线程因为锁的互斥，等待锁的线程被阻塞，线程长期无法执行，导致线程饥饿

假如两个线程thread0和thread1，thread0长时间持有读锁不放，这时如果thread1要获取写锁，就会被阻塞，成为饥饿线程

##### StampedLock

|             方法名              |           描述           |
| :-----------------------------: | :----------------------: |
|         long readLock()         | 获取读锁，返回一个锁标识 |
|        long writeLock()         | 获取写锁，返回一个锁标识 |
|     void unlock(long stamp)     |        释放读写锁        |
|   void unlockRead(long stamp)   |         释放读锁         |
|  void unlockWrite(long stamp)   |         释放写锁         |
|        Lock asReadLock()        |        转换为读锁        |
|       Lock asWriteLock()        |        转换为写锁        |
| ReadWriteLock asReadWriteLock() |       转换为读写锁       |

写一个数据类

```java
public class Data {

    private String message;

    private final StampedLock lock = new StampedLock();

    public String getMessage() {
        long readLock = lock.readLock();
        try {
            Thread.sleep(100);
            return message;
        } catch (InterruptedException e) {
            e.printStackTrace();
            return null;
        } finally {
            lock.unlock(readLock);
        }
    }

    public void setMessage(String message) {
        long writeLock = lock.writeLock();
        try {
            Thread.sleep(100);
            this.message = message;
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlockWrite(writeLock);
        }
    }
}
```

读任务和写任务

```java
public class ReadTask implements Runnable {

    private Data data;

    public ReadTask(Data data) {
        this.data = data;
    }

    @Override
    public void run() {
        while (true) {
            System.out.println(data.getMessage());
        }
    }
}
```

```java
public class WriteTask implements Runnable {

    private Data data;

    public WriteTask(Data data) {
        this.data = data;
    }

    @Override
    public void run() {
        int i = 0;
        while (true) {
            data.setMessage("Message " + i++);
        }
    }
}
```

主线程

```java
public class Main {
    public static void main(String[] args) {
        Data data = new Data();
        ReadTask readTask = new ReadTask(data);
        WriteTask writeTask = new WriteTask(data);
        Thread readThread = new Thread(readTask);
        Thread writeThread = new Thread(writeTask);
        readThread.start();
        writeThread.start();
    }
}
```

输出：

> null
> Message 0
> Message 1
> Message 2
> Message 3
> Message 4



#### StampedLock可重入性

|      |   读锁   |   写锁   |
| :--: | :------: | :------: |
| 读锁 |  可重入  | 不可重入 |
| 写锁 | 不可重入 | 不可重入 |

##### 读读可重入

两次获取同一把读锁

```java
public class Main {

    public static StampedLock sl = new StampedLock();

    public static void main(String[] args) {
        printA();
    }

    public static void printA() {
        long readLock = sl.readLock();
        try {
            System.out.println("printA");
            printB();
        } finally {
            sl.unlockRead(readLock);
        }
    }

    public static void printB() {
        long readLock = sl.readLock();
        try {
            System.out.println("printB");
        } finally {
            sl.unlockRead(readLock);
        }
    }
}
```

输出：

> printA
> printB

##### 读写不可重入

把B里面的读锁改成写锁，或把A里面的读锁改成写锁

```java
public class Main {

    public static StampedLock sl = new StampedLock();

    public static void main(String[] args) {
        printA();
    }

    public static void printA() {
        long readLock = sl.readLock();
        try {
            System.out.println("printA");
            printB();
        } finally {
            sl.unlockRead(readLock);
        }
    }

    public static void printB() {
        long writeLock = sl.writeLock();
        try {
            System.out.println("printB");
        } finally {
            sl.unlockWrite(writeLock);
        }
    }
}
```

输出printA（这里把B里面的读锁改成写锁）后程序始终等待A释放读锁，程序始终等待无法结束

##### 写写不可重入

把两个锁都改成写锁

```java
public class Main {

    public static StampedLock sl = new StampedLock();

    public static void main(String[] args) {
        printA();
    }

    public static void printA() {
        long writeLock = sl.writeLock();
        try {
            System.out.println("printA");
            printB();
        } finally {
            sl.unlockWrite(writeLock);
        }
    }

    public static void printB() {
        long writeLock = sl.writeLock();
        try {
            System.out.println("printB");
        } finally {
            sl.unlockWrite(writeLock);
        }
    }
}
```

输出printA后程序始终等待，无法结束



#### 线程状态和生命周期

##### 6种状态

|     状态      |        描述        |                           触发条件                           |
| :-----------: | :----------------: | :----------------------------------------------------------: |
|      NEW      |    刚创建的线程    |                         new Thread()                         |
|   RUNNABLE    | 可执行或执行的线程 |                        Thread.start()                        |
|    BLOCKED    | 被阻塞等待锁的线程 |                synchronized<br />Lock.lock()                 |
|    WAITING    |  无限期等待的线程  | Thread.join()<br />Object.wait()<br />Condition.await()<br />LockSupport.park() |
| TIMED_WAITING |   限期等待的线程   | Thread.sleep()<br />超时的Thread.join()<br />超时的Object.wait()<br />超时的Condition.await()<br />超时的LockSupport.park() |
|  TERMINATED   |    已退出的线程    |                         线程执行结束                         |

![ThreadState](../../../../images/posts/2025/08/multithread/pics/ThreadState.png)

##### NEW

```java
public class Main {
    public static void main(String[] args) {
        Thread thread = new Thread();
        System.out.println(thread.getState());
    }
}
```

输出：

> NEW

##### RUNNABLE

```java
public class Main {
    public static void main(String[] args) {
        Thread thread = new Thread();
        thread.start();
        System.out.println(thread.getState());
    }
}
```

输出：

> RUNNABLE

##### BLOCKED

任务线程获得线程锁

```java
public class Task implements Runnable {
    @Override
    public void run() {
        synchronized (this) {
            System.out.println(Thread.currentThread().getState());
        }
    }
}
```

主线程中先于任务线程获得锁，首先启动线程，由于主线程持有锁，任务线程被阻塞，但是这时已执行到输出状态这句，所以立刻输出RUNNABLE，过1秒后主线程输出状态BLOCKED，然后任务线程获得锁，状态由BLOCKED变为RUNNABLE

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        Thread thread = new Thread(task);
        synchronized (task) {
            thread.start();
            System.out.println(thread.getState());
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println(thread.getState());
        }
    }
}
```

输出：

> RUNNABLE
>
> （1秒后）
>
> BLOCKED
> RUNNABLE

##### WAITING

任务线程

```java
public class Task implements Runnable {
    @Override
    public void run() {
        synchronized (this) {
            try {
                System.out.println(Thread.currentThread().getState());
                wait();
                System.out.println(Thread.currentThread().getState());
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

        }
    }
}
```

主线程

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        Thread thread = new Thread(task);
        thread.start();
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        synchronized (task) {
            System.out.println(thread.getState());
            task.notify();
        }
    }
}
```

输出：

> RUNNABLE
>
> （1秒后）
>
> WAITING
> RUNNABLE

任务线程先输出RUNNABLE状态，然后进入等待。这时主线程睡了1秒，主线程获取锁后打印出任务线程的WAITING状态，然后唤醒任务线程，任务线程重新变为RUNNABLE

##### TIMED_WAITING

任务线程

```java
public class Task implements Runnable {
    @Override
    public void run() {
        synchronized (this) {
            try {
                System.out.println(Thread.currentThread().getState());
                Thread.sleep(2000);
                System.out.println(Thread.currentThread().getState());
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

        }
    }
}
```

主线程

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        Thread thread = new Thread(task);
        thread.start();
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println(thread.getState());
    }
}
```

输出：

> RUNNABLE
>
> （1秒后）
>
> TIMED_WAITING
>
> （1秒后）
>
> RUNNABLE

##### TERMINATED

任务线程

```java
public class Task implements Runnable {
    @Override
    public void run() {
            System.out.println(Thread.currentThread().getState());
    }
}
```

主线程

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        Thread thread = new Thread(task);
        thread.start();
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println(thread.getState());
    }
}
```

输出：

> RUNNABLE
>
> （1秒后）
>
> TERMINATED



#### ThreadLocal

##### 线程本地变量

* ThreadLocal的定位是什么？操作线程属性的工具类
* ThreadLocal与Thread的关系是什么？ThreadLocal与Thread是相互协作的关系，Thread负责存储数据，ThreadLocal负责操作数据。ThreadLocal里面有一个静态内部类ThreadLocalMap，里面存放了Entry数组，是哈希表的键，为ThreadLocal<?>类型，而哈希表的值为Thread

|                           方法名                            |                   描述                    |
| :---------------------------------------------------------: | :---------------------------------------: |
| ThreadLocal\<S> withInitial(Supplier<? extends S> supplier) |  创建ThreadLocal实例，并提供初始值构造器  |
|                           T get()                           | 获取ThreadLocal在当前线程中保存的变量副本 |
|                      void set(T value)                      | 设置ThreadLocal在当前线程中保存的变量副本 |
|                        void remove()                        | 删除ThreadLocal在当前线程中保存的变量副本 |

![ThreadLocal](../../../../images/posts/2025/08/multithread/pics/ThreadLocal.png)

##### 演示

创建一个线程本地变量和两个线程，然后启动这两个线程

```java
public class Main {
    public static void main(String[] args) {
        ThreadLocal<String> tl = new ThreadLocal<>();
        Thread thread0 = new Thread() {
            @Override
            public void run() {
                tl.set("thread0");
            }
        };
        Thread thread1 = new Thread() {
            @Override
            public void run() {
                System.out.println(tl.get());
            }
        };
        thread0.start();
        thread1.start();
    }
}
```

输出null，因为只在thread0中保存了数据，而thread1中没有任何数据

修改每个线程中，set完get

```java
public class Main {
    public static void main(String[] args) {
        ThreadLocal<String> tl = new ThreadLocal<>();
        Thread thread0 = new Thread() {
            @Override
            public void run() {
                tl.set("thread0");
                System.out.println(tl.get());
            }
        };
        Thread thread1 = new Thread() {
            @Override
            public void run() {
                tl.set("thread1");
                System.out.println(tl.get());
            }
        };
        thread0.start();
        thread1.start();
    }
}
```

输出：

> thread0
> thread1

set完remove

```java
public class Main {
    public static void main(String[] args) {
        ThreadLocal<String> tl = new ThreadLocal<>();
        Thread thread0 = new Thread() {
            @Override
            public void run() {
                tl.set("thread0");
                System.out.println(tl.get());
                tl.remove();
                System.out.println(tl.get());
            }
        };
        thread0.start();
    }
}
```

输出：

> thread0
> null

**注意在线程即将结束时，一定要remove，防止发生内存泄漏**

##### 线程间如何共享ThreadLocal？

使用带泛型的InheritableThreadLocal，这个类继承自ThreadLocal，使用的方法都一样

先写一个B线程

```java
public class ThreadB extends Thread {

    @Override
    public void run() {
        System.out.println(ThreadA.tl.get());
    }
}
```

再写一个A线程，在A线程里设置tl值并创建B线程

```java
public class ThreadA extends Thread {

    public static final InheritableThreadLocal<String> tl = new InheritableThreadLocal<>();

    @Override
    public void run() {
        tl.set("threadA");
        ThreadB threadB = new ThreadB();
        threadB.start();
    }
}
```

主线程

```java
public class Main {
    public static void main(String[] args) {
        ThreadA a = new ThreadA();
        a.start();
    }
}
```

输出threadA，说明InheritableThreadLocal<>可以在线程间共享



#### 线程池

##### 概要

* 线程池是一种基于池化思想管理线程的工具
* 降低资源消耗：通过重复利用已创建的线程降低线程创建和销毁造成的消耗
* 提高响应速度：当有任务时，任务可以不需要等到线程创建就能立即执行
* 提高线程的可管理性：线程池可以进行统一的分配，调优和监控

传统写法的缺点：一个任务只能创建对应的线程执行，执行完线程销毁，既费时费力，线程的频繁创建和销毁也会占用资源

线程池解决的：线程复用

```java
public class Main {
    public static void main(String[] args) {
        Runnable task0 = new Task();
        Runnable task1 = new Task();
        Runnable task2 = new Task();
        ExecutorService threadPool = Executors.newSingleThreadExecutor();
        threadPool.execute(task0);
        threadPool.execute(task1);
        threadPool.execute(task2);
        threadPool.shutdown();
    }
}
```

Task输出当前线程的名称，发现是3个相同的名称，说明线程池对线程进行了复用

![ScheduledThreadPoolExecutor](../../../../images/posts/2025/08/multithread/pics/ScheduledThreadPoolExecutor.png)

##### 创建方法

核心的类是ThreadPoolExecutor

构造函数：

```java
ThreadPoolExecutor(int corePoolSize,
                  int maximumPoolSize,
                  long keepAliveTime,
                  TimeUnit unit,
                  BlockingQueue<Runnable> workQueue,
                  ThreadFactory threadFactory,
                  RejectedExecutionHandler handler)
```

|      参数       |       描述       |
| :-------------: | :--------------: |
|  corePoolSize   |    核心线程数    |
| maximumPoolSize |    最大线程数    |
|  keepAliveTime  | 空闲线程存活时间 |
|      unit       |     时间单位     |
|    workQueue    |     任务队列     |
|  threadFactory  |     线程工厂     |
|     handler     |   任务拒绝策略   |

举例

| corePoolSize | maximumPoolSize | keepAliveTime |       unit       |
| :----------: | :-------------: | :-----------: | :--------------: |
|      10      |       25        |      10       | TimeUnit.SECONDS |

![ThreadPool](../../../../images/posts/2025/08/multithread/pics/ThreadPool.png)

核心线程有10个，这10个线程一旦被线程池创建就会一直存在。最大容量25，除去10个核心线程外，还有15个非核心线程。这些非核心线程如果在10秒内没被使用，就会被销毁

任务队列是提交给线程池的线程们，可以用链式阻塞队列`LinkedBlockingQueue<>`或数组阻塞队列`ArrayBlockingQueue<>`

线程工厂是一个接口，定义了创建线程的工厂方法，比如下面这个名字序号递增地创建线程

```java
public class CustomThreadFactory implements ThreadFactory {
    // 计数器
    private final AtomicInteger i = new AtomicInteger(1);

    @Override
    public Thread newThread(Runnable r) {
        // 创建线程，并指定任务
        Thread thread = new Thread(r);
        // 设置线程名称
        thread.setName("线程" + i.getAndIncrement() + "号");
        // 返回线程
        return thread;
    }
}
```

下面是默认的线程工厂

```java
public class Executors {
	public static ThreadFactory defaultThreadFactory() {
        return new DefaultThreadFactory();
    }
}
```

任务拒绝策略需要同时满足下面四个条件才会被拒绝

1. 线程池中的线程已满
2. 无法再继续扩容
3. 没有空闲线程
4. 任务队列已满

有几种策略

|    任务拒绝策略     |                        描述                        |
| :-----------------: | :------------------------------------------------: |
|     AbortPolicy     | 默认的拒绝策略，抛出RejectedExecutionException异常 |
|    DiscardPolicy    |                    直接丢弃任务                    |
| DiscardOldestPolicy |    丢弃处于任务队列头部的任务，添加被拒绝的任务    |
|  CallerRunsPolicy   |         使用调用者线程直接执行被拒绝的任务         |

下面是创建线程池的案例

首先写一个任务类

```java
public class Task implements Runnable {
    @Override
    public void run() {
        System.out.println(Thread.currentThread().getName());
    }
}
```

自定义的线程工厂方法，代码在上边

主线程，主要在这里创建了线程池

```java
public class Main {
    public static void main(String[] args) {
        Task task0 = new Task();
        Task task1 = new Task();
        Task task2 = new Task();
        ThreadPoolExecutor threadPool = new ThreadPoolExecutor(10, 25, 10L,
                TimeUnit.SECONDS,
                new LinkedBlockingQueue<>(),
                new CustomThreadFactory(),
                new ThreadPoolExecutor.AbortPolicy());
        threadPool.execute(task0);
        threadPool.execute(task1);
        threadPool.execute(task2);
        threadPool.shutdown();
    }
}
```

运行，输出：

> 线程1号
> 线程3号
> 线程2号



#### 3种危险的线程池创建方式

##### 简介

* FixedThreadPool
* SingleThreadExecutor
* CachedThreadPool

在Executors中有12种创建线程池的方法

|                            方法名                            |                           描述                           |
| :----------------------------------------------------------: | :------------------------------------------------------: |
|               newFixedThreadPool(int nThreads)               |                   创建固定大小的线程池                   |
| newFixedThreadPool(int nThreads, ThreadFactory threadFactory) |           创建固定大小的线程池，并指定线程工厂           |
|                  newSingleThreadExecutor()                   |                   创建单个线程的线程池                   |
|     newSingleThreadExecutor(ThreadFactory threadFactory)     |           创建单个线程的线程池，并指定线程工厂           |
|                    newCachedThreadPool()                     |                    创建可缓存的线程池                    |
|       newCachedThreadPool(ThreadFactory threadFactory)       |            创建可缓存的线程池，并指定线程工厂            |
|                    newWorkStealingPool()                     |                创建fork-join形式的线程池                 |
|             newWorkStealingPool(int parallelism)             |        创建fork-join形式的线程池，并指定并行级别         |
|           newScheduledThreadPool(int corePoolSize)           |              创建执行延时或定期任务的线程池              |
| newScheduledThreadPool(int corePoolSize, ThreadFactory threadFactory) |      创建执行延时或定期任务的线程池，并指定线程工厂      |
|                  newSingleThreadExecutor()                   |         创建执行延时或定期任务的单个线程的线程池         |
|     newSingleThreadExecutor(ThreadFactory threadFactory)     | 创建执行延时或定期任务的单个线程的线程池，并指定线程工厂 |

##### newFixedThreadPool

创建数量为nThreads全是核心线程的线程池

```java
public static ExecutorService newFixedThreadPool(int nThreads) {
    return new ThreadPoolExecutor(nThreads, nThreads,
                                  0L, TimeUnit.MILLISECONDS,
                                  new LinkedBlockingQueue<Runnable>());
}
```

由于LinkedBlockingQueue最大元素可以有2^31-1个，容易爆内存，所以不建议

##### newSingleThreadExecutor

创建只有1个核心线程的线程池

```java
public static ExecutorService newSingleThreadExecutor() {
    return new FinalizableDelegatedExecutorService
        (new ThreadPoolExecutor(1, 1,
                                0L, TimeUnit.MILLISECONDS,
                                new LinkedBlockingQueue<Runnable>()));
}
```

同样，由于LinkedBlockingQueue最大元素可以有2^31-1个，容易爆内存，所以不建议

##### newCachedThreadPool

创建没有核心线程，最大2^31-1个非核心线程的线程池，60秒不工作销毁非核心线程

```java
public static ExecutorService newCachedThreadPool() {
    return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                  60L, TimeUnit.SECONDS,
                                  new SynchronousQueue<Runnable>());
}
```

由于最大线程数开得太大，也存在爆内存的风险



#### 提交任务到线程池

##### execute

写一个任务线程

```java
public class Task implements Runnable {
    @Override
    public void run() {
        System.out.println(Thread.currentThread().getName());
    }
}
```

主线程创建线程池，用execute方法提交线程

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        ExecutorService threadPool = Executors.newSingleThreadExecutor();
        threadPool.execute(task);
        threadPool.shutdown();
    }
}
```

输出：

> pool-1-thread-1

##### submit

|             方法名              | 返回值类型 |              描述              |
| :-----------------------------: | :--------: | :----------------------------: |
|      submit(Runnable task)      | Future<?>  |        提交Runnable任务        |
| submit(Runnable task, T result) | Future\<T> | 提交Runnable任务并指定执行结果 |
|    submit(Callable\<T> task)    | Future\<T> |        提交Callable任务        |

提交Runnable任务也要返回Future的原因是，可以检测线程是否执行完成以及是否抛出异常

Future是一个接口，定义了与任务执行结果相关的功能

```java
public interface Future<V> {
    boolean cancel(boolean mayInterruptIfRunning);
    boolean isCancelled();
    boolean isDone();
    V get() throws InterruptedException, ExecutionException;
    V get(long timeout, TimeUnit unit)
        throws InterruptedException, ExecutionException, TimeoutException;
}
```

|                方法名                 | 返回值类型 |                        描述                        |
| :-----------------------------------: | :--------: | :------------------------------------------------: |
| cancel(boolean mayInterruptIfRunning) |  boolean   |        是否取消任务，true取消，false不取消         |
|             isCancelled()             |  boolean   |                    任务是否取消                    |
|               isDone()                |  boolean   |                    任务是否完成                    |
|                 get()                 |     V      |                  获取任务执行结果                  |
|   get(long timeout, TimeUnit unit)    |     V      | 在指定时间内获取任务执行结果，若超时则抛出超时异常 |

修改execute为submit

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        ExecutorService threadPool = Executors.newSingleThreadExecutor();
        Future<?> future = threadPool.submit(task);
        try {
            Object result = future.get();
            System.out.println(result);
        } catch (ExecutionException | InterruptedException e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
        }
    }
}
```

输出：

> pool-1-thread-1
> null

因为没有指定返回值，所以返回null

更换为有返回值的，返回值可以是Object，数字，字符串，布尔值

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        ExecutorService threadPool = Executors.newSingleThreadExecutor();
        Future<String> future = threadPool.submit(task, "完辣！");
        try {
            String result = future.get();
            System.out.println(result);
        } catch (ExecutionException | InterruptedException e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
        }
    }
}
```

输出：

> pool-1-thread-1
> 完辣！

写一个有返回值的Callable任务，返回1+1的值

```java
public class ResultTask implements Callable<Integer> {
    @Override
    public Integer call() throws Exception {
        return 1 + 1;
    }
}
```

修改主线程中的submit接收Integer返回值

```java
public class Main {
    public static void main(String[] args) {
        ResultTask task = new ResultTask();
        ExecutorService threadPool = Executors.newSingleThreadExecutor();
        Future<Integer> future = threadPool.submit(task);
        try {
            Integer result = future.get();
            System.out.println(result);
        } catch (ExecutionException | InterruptedException e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
        }
    }
}
```

输出2

##### 区别

|                | execute  |         submit         |
| :------------: | :------: | :--------------------: |
|      位置      | Executor |    ExecutorService     |
| 提交任务的类别 | Runnable | Runnable<br />Callable |
|   返回值类型   |   void   |         Future         |



#### 获取任务的方式

获取任务有两种方法，这两种方法都是阻塞式的

|              方法名              | 返回值类型 |                        描述                        |
| :------------------------------: | :--------: | :------------------------------------------------: |
|              get()               |     V      |                  获取任务执行结果                  |
| get(long timeout, TimeUnit unit) |     V      | 在指定时间内获取任务执行结果，若超时则抛出超时异常 |

##### get

写一个有返回值的Callable任务线程，返回1+1的值，代码和上面的一样

写一个主线程，在里面定义线程池和任务返回值，阻塞式获取任务返回结果

```java
public class Main {
    public static void main(String[] args) {
        ResultTask task = new ResultTask();
        ExecutorService threadPool = Executors.newSingleThreadExecutor();
        Future<Integer> future = threadPool.submit(task);
        try {
            Integer result = future.get();
            System.out.println(result);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
        }
    }
}
```

输出2

##### get(long timeout, TimeUnit unit)

任务线程里睡3秒

```java
public class ResultTask implements Callable<Integer> {
    @Override
    public Integer call() throws Exception {
        TimeUnit.SECONDS.sleep(3);
        return 1 + 1;
    }
}
```

主线程的get设置超时为1秒，必定超时

```java
public class Main {
    public static void main(String[] args) {
        ResultTask task = new ResultTask();
        ExecutorService threadPool = Executors.newSingleThreadExecutor();
        Future<Integer> future = threadPool.submit(task);
        try {
            Integer result = future.get(1, TimeUnit.SECONDS);
            System.out.println(result);
        } catch (InterruptedException | ExecutionException | TimeoutException e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
        }
    }
}
```

输出：

> java.util.concurrent.TimeoutException
> 	at java.base/java.util.concurrent.FutureTask.get(FutureTask.java:204)
> 	at com.neko.juc36.Main.main(Main.java:11)

改成5秒超时

```java
public class Main {
    public static void main(String[] args) {
        ResultTask task = new ResultTask();
        ExecutorService threadPool = Executors.newSingleThreadExecutor();
        Future<Integer> future = threadPool.submit(task);
        try {
            Integer result = future.get(5, TimeUnit.SECONDS);
            System.out.println(result);
        } catch (InterruptedException | ExecutionException | TimeoutException e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
        }
    }
}
```

输出2



#### 取消任务

##### cancel

cancel是Future的一个接口，由FutureTask实现

```java
public boolean cancel(boolean mayInterruptIfRunning) {
    if (!(state == NEW && STATE.compareAndSet
          (this, NEW, mayInterruptIfRunning ? INTERRUPTING : CANCELLED)))
        return false;
    try {    // in case call to interrupt throws exception
        if (mayInterruptIfRunning) {
            try {
                Thread t = runner;
                if (t != null)
                    t.interrupt();
            } finally { // final state
                STATE.setRelease(this, INTERRUPTED);
            }
        }
    } finally {
        finishCompletion();
    }
    return true;
}
```

传入一个布尔变量mayInterruptIfRunning，没有处理false只处理了true，当值为true时，调用正在执行任务的线程的interrupt方法，用来响应中断线程指令的执行中的任务

任务从提交到线程池到任务完成共经历了3个阶段

```
		任务未执行		任务正在执行
submit	----->	任务队列	----->	任务完成
```

##### 取消未执行的任务

写一个任务线程，输出1+1的结果

```java
public class ResultTask implements Callable<Integer> {
    @Override
    public Integer call() throws Exception {
        return 1 + 1;
    }
}
```

在主线程中判断任务是否取消成功，因为线程池中最大线程数量为1，所以第二个任务线程会被放入等待队列，现在取消第二个任务线程，看是否取消成功

```java
public class Main {
    public static void main(String[] args) {
        ResultTask task = new ResultTask();
        ExecutorService threadPool = Executors.newSingleThreadExecutor();
        Future<Integer> future1 = threadPool.submit(task);
        Future<Integer> future2 = threadPool.submit(task);
        boolean cancel = future2.cancel(false);
        System.out.println(cancel);
        System.out.println(future2.isCancelled());
        try {
            Integer result = future2.get();
            System.out.println(result);
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
        }
    }
}
```

输出：

> true
> true
> Exception in thread "main" java.util.concurrent.CancellationException
> 	at java.base/java.util.concurrent.FutureTask.report(FutureTask.java:121)
> 	at java.base/java.util.concurrent.FutureTask.get(FutureTask.java:191)
> 	at com.neko.juc36.Main.main(Main.java:16)

前两个结果表示取消成功，第三个报错表示已经取消的线程无法获得结果

##### 取消执行完的任务

任务线程保持不变，主线程调整位置

```java
public class Main {
    public static void main(String[] args) {
        ResultTask task = new ResultTask();
        ExecutorService threadPool = Executors.newSingleThreadExecutor();
        Future<Integer> future = threadPool.submit(task);
        try {
            Integer result = future.get();
            System.out.println(result);
            boolean cancel = future.cancel(false);
            System.out.println(cancel);
            System.out.println(future.isCancelled());
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
        }
    }
}
```

输出：

> 2
> false
> false

第一个2表示线程执行完，后面两个false是取消失败的返回值

##### 取消正在执行的任务

任务线程中如果线程未被中断，i会持续递增

```java
public class ResultTask implements Callable<Integer> {
    @Override
    public Integer call() throws Exception {
        int i = 0;
        while (!Thread.interrupted()) {
            ++i;
        }
        System.out.println(i);
        return 1 + 1;
    }
}
```

主线程调整位置，把取消的逻辑放在前面，在取消前输出线程是否结束，最后取消后获取任务线程的运行结果

```java
public class Main {
    public static void main(String[] args) {
        ResultTask task = new ResultTask();
        ExecutorService threadPool = Executors.newSingleThreadExecutor();
        Future<Integer> future = threadPool.submit(task);
        System.out.println(future.isDone());
        boolean cancel = future.cancel(false);
        System.out.println(cancel);
        System.out.println(future.isCancelled());
        try {
            Integer result = future.get();
            System.out.println(result);
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
        }
    }
}
```

输出如下，输出之后程序并没有结束，需要手动中止

> false
> true
> true
> Exception in thread "main" java.util.concurrent.CancellationException
> 	at java.base/java.util.concurrent.FutureTask.report(FutureTask.java:121)
> 	at java.base/java.util.concurrent.FutureTask.get(FutureTask.java:191)
> 	at com.neko.juc36.Main.main(Main.java:29)

第一个false表示线程还没结束，第二个和第三个true表示线程取消成功，最后一个报错表示已经取消的任务不能获得结果

mayInterruptIfRunning参数传入true，线程池关闭后，线程会中断

```java
public class Main {
    public static void main(String[] args) {
        ResultTask task = new ResultTask();
        ExecutorService threadPool = Executors.newSingleThreadExecutor();
        Future<Integer> future = threadPool.submit(task);
        System.out.println(future.isDone());
        boolean cancel = future.cancel(true);
        System.out.println(cancel);
        System.out.println(future.isCancelled());
        try {
            Integer result = future.get();
            System.out.println(result);
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
        }
    }
}
```

输出如下：

> false
> 37
> true
> true
> Exception in thread "main" java.util.concurrent.CancellationException
> 	at java.base/java.util.concurrent.FutureTask.report(FutureTask.java:121)
> 	at java.base/java.util.concurrent.FutureTask.get(FutureTask.java:191)
> 	at com.neko.juc36.Main.main(Main.java:29)

第一个false表示线程还没执行完，由于mayInterruptIfRunning参数传入了true，导致线程在取消后被中断。又因为在任务线程中响应了中断信号，所以任务线程输出while外面的i值即37。接下来两个true表示取消成功，后面的报错表示取消的线程无法获得结果

mayInterruptIfRunning为true时，任务不一定会立刻结束，任务如果不响应中断线程指令的话，会继续执行完。也就是说，即使取消了任务且传参为true，也要在任务线程中判断中断标记

##### 总结

| 取消任务的时间段 |                             结束                             |
| :--------------: | :----------------------------------------------------------: |
|      未执行      |                引发CancellationException异常                 |
|     正在执行     | TRUE：1.引发CancellationException异常。2.响应中断线程指令或任务继续执行完<br />FALSE：1.引发CancellationException异常。2.任务继续执行完 |
|      已完成      |                           无法取消                           |



#### 任务拒绝策略

##### 简介

有四种任务拒绝策略

|    任务拒绝策略     |                        描述                        |
| :-----------------: | :------------------------------------------------: |
|     AbortPolicy     | 默认的拒绝策略，抛出RejectedExecutionException异常 |
|    DiscardPolicy    |                    直接丢弃任务                    |
| DiscardOldestPolicy |    丢弃处于任务队列头部的任务，添加被拒绝的任务    |
|  CallerRunsPolicy   |         使用调用者线程直接执行被拒绝的任务         |

在ThreadPoolExecutor中，定义了这四个静态类：

```java
public class ThreadPoolExecutor extends AbstractExecutorService {
	public static class CallerRunsPolicy implements RejectedExecutionHandler {}
	public static class AbortPolicy implements RejectedExecutionHandler {}
	public static class DiscardPolicy implements RejectedExecutionHandler {}
	public static class DiscardOldestPolicy implements RejectedExecutionHandler {}
}
```

这四个静态类实现了接口，接口中有一个拒绝线程池中任务的函数

```java
public interface RejectedExecutionHandler {
    void rejectedExecution(Runnable r, ThreadPoolExecutor executor);
}
```

##### DiscardPolicy

这个策略的内容什么也没有，多出来的线程会被直接丢弃

```java
public static class DiscardPolicy implements RejectedExecutionHandler {
    /**
     * Creates a {@code DiscardPolicy}.
     */
    public DiscardPolicy() { }

    /**
     * Does nothing, which has the effect of discarding task r.
     *
     * @param r the runnable task requested to be executed
     * @param e the executor attempting to execute this task
     */
    public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
    }
}
```

任务线程中接收外部传进来的index参数，然后打印

```java
public class Task implements Runnable {

    private final int index;

    public Task(int index) {
        this.index = index;
    }

    @Override
    public void run() {
        System.out.println(Thread.currentThread().getName() + ": " + index);
    }
}
```

主线程中定义一个最大线程数量为1的线程池，LinkedBlockingQueue大小为1，应用DiscardPolicy。随后提交3个任务线程

```java
public class Main {
    public static void main(String[] args) {
        ThreadPoolExecutor threadPool = new ThreadPoolExecutor(1, 1, 0L,
                TimeUnit.SECONDS,
                new LinkedBlockingQueue<>(1),
                new ThreadPoolExecutor.DiscardPolicy());
        try {
            threadPool.execute(new Task(1));
            threadPool.execute(new Task(2));
            threadPool.execute(new Task(3));
        } catch (RejectedExecutionException e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
        }
    }
}
```

输出：

> pool-1-thread-1: 1
> pool-1-thread-1: 2

发现只接收了index为1和2的两个线程，index为3的线程被直接抛弃

##### CallerRunsPolicy

这个策略让被丢弃的线程在被调用的线程上执行

```java
public static class CallerRunsPolicy implements RejectedExecutionHandler {
    /**
     * Creates a {@code CallerRunsPolicy}.
     */
    public CallerRunsPolicy() { }

    /**
     * Executes task r in the caller's thread, unless the executor
     * has been shut down, in which case the task is discarded.
     *
     * @param r the runnable task requested to be executed
     * @param e the executor attempting to execute this task
     */
    public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
        if (!e.isShutdown()) {
            r.run();
        }
    }
}
```

任务线程保持不变，主线程策略改为CallerRunsPolicy

```java
public class Main {
    public static void main(String[] args) {
        ThreadPoolExecutor threadPool = new ThreadPoolExecutor(1, 1, 0L,
                TimeUnit.SECONDS,
                new LinkedBlockingQueue<>(1),
                new ThreadPoolExecutor.CallerRunsPolicy());
        try {
            threadPool.execute(new Task(1));
            threadPool.execute(new Task(2));
            threadPool.execute(new Task(3));
        } catch (RejectedExecutionException e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
        }
    }
}
```

输出：

> main: 3
> pool-1-thread-1: 1
> pool-1-thread-1: 2

发现多出来的3号线程被主线程执行了

##### AbortPolicy(用得最多)

这个策略在线程被丢弃时抛出异常

```java
public static class AbortPolicy implements RejectedExecutionHandler {
    /**
     * Creates an {@code AbortPolicy}.
     */
    public AbortPolicy() { }

    /**
     * Always throws RejectedExecutionException.
     *
     * @param r the runnable task requested to be executed
     * @param e the executor attempting to execute this task
     * @throws RejectedExecutionException always
     */
    public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
        throw new RejectedExecutionException("Task " + r.toString() +
                                             " rejected from " +
                                             e.toString());
    }
}
```

任务线程保持不变，主线程策略改为AbortPolicy

```java
public class Main {
    public static void main(String[] args) {
        ThreadPoolExecutor threadPool = new ThreadPoolExecutor(1, 1, 0L,
                TimeUnit.SECONDS,
                new LinkedBlockingQueue<>(1),
                new ThreadPoolExecutor.AbortPolicy());
        try {
            threadPool.execute(new Task(1));
            threadPool.execute(new Task(2));
            threadPool.execute(new Task(3));
        } catch (RejectedExecutionException e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
        }
    }
}
```

输出：

> java.util.concurrent.RejectedExecutionException: Task com.neko.juc37.Task@568db2f2 rejected from java.util.concurrent.ThreadPoolExecutor@378bf509[Running, pool size = 1, active threads = 1, queued tasks = 1, completed tasks = 0]
> 	at java.base/java.util.concurrent.ThreadPoolExecutor$AbortPolicy.rejectedExecution(ThreadPoolExecutor.java:2065)
> 	at java.base/java.util.concurrent.ThreadPoolExecutor.reject(ThreadPoolExecutor.java:833)
> 	at java.base/java.util.concurrent.ThreadPoolExecutor.execute(ThreadPoolExecutor.java:1365)
> 	at com.neko.juc37.Main.main(Main.java:19)
> pool-1-thread-1: 1
> pool-1-thread-1: 2

发现因为3号线程被抛弃导致报错

##### DiscardOldestPolicy

丢弃处于任务队列头部的任务，添加被拒绝的任务

```java
public static class DiscardOldestPolicy implements RejectedExecutionHandler {
    /**
     * Creates a {@code DiscardOldestPolicy} for the given executor.
     */
    public DiscardOldestPolicy() { }

    /**
     * Obtains and ignores the next task that the executor
     * would otherwise execute, if one is immediately available,
     * and then retries execution of task r, unless the executor
     * is shut down, in which case task r is instead discarded.
     *
     * @param r the runnable task requested to be executed
     * @param e the executor attempting to execute this task
     */
    public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
        if (!e.isShutdown()) {
            e.getQueue().poll();
            e.execute(r);
        }
    }
}
```

任务线程保持不变，主线程策略改为DiscardOldestPolicy，并且LinkedBlockingQueue容量改为2，线程池中提交4个任务

```java
public class Main {
    public static void main(String[] args) {
        ThreadPoolExecutor threadPool = new ThreadPoolExecutor(1, 1, 0L,
                TimeUnit.SECONDS,
                new LinkedBlockingQueue<>(2),
                new ThreadPoolExecutor.DiscardOldestPolicy());
        try {
            threadPool.execute(new Task(1));
            threadPool.execute(new Task(2));
            threadPool.execute(new Task(3));
            threadPool.execute(new Task(4));
        } catch (RejectedExecutionException e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
        }
    }
}
```

输出：

> pool-1-thread-1: 1
> pool-1-thread-1: 3
> pool-1-thread-1: 4

发现最早加入LinkedBlockingQueue的2号线程被丢弃，多出来的4号线程被加入



#### 关闭线程池

##### shutdown

关闭线程池，不再接收新任务，继续执行完任务队列中的任务

shutdown有两个特点：

1. 不再接收新任务
2. 继续执行完任务队列中的任务

##### 不再接收新任务

写一个任务线程，打印传入的序号

```java
public class Task implements Runnable {

    private final int index;

    public Task(int index) {
        this.index = index;
    }

    @Override
    public void run() {
        System.out.println(Thread.currentThread().getName() + ": " + index);
    }
}
```

主线程中定义一个线程池，提交完1号任务后关闭，关闭后再提交一个2号任务

```java
public class Main {
    public static void main(String[] args) {
        ThreadPoolExecutor threadPool = new ThreadPoolExecutor(1, 1, 0L,
                TimeUnit.SECONDS,
                new LinkedBlockingQueue<>(1),
                new ThreadPoolExecutor.AbortPolicy());
        try {
            threadPool.execute(new Task(1));
        } catch (RejectedExecutionException e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
            threadPool.execute(new Task(2));
        }
    }
}
```

输出：

> Exception in thread "main" java.util.concurrent.RejectedExecutionException: Task com.neko.juc38.Task@568db2f2 rejected from java.util.concurrent.ThreadPoolExecutor@378bf509[Shutting down, pool size = 1, active threads = 1, queued tasks = 0, completed tasks = 0]
> 	at java.base/java.util.concurrent.ThreadPoolExecutor$AbortPolicy.rejectedExecution(ThreadPoolExecutor.java:2065)
> 	at java.base/java.util.concurrent.ThreadPoolExecutor.reject(ThreadPoolExecutor.java:833)
> 	at java.base/java.util.concurrent.ThreadPoolExecutor.execute(ThreadPoolExecutor.java:1365)
> 	at com.neko.juc38.Main.main(Main.java:20)
> pool-1-thread-1: 1

发现再来的2号任务被按照指定的任务拒绝策略拒绝

##### 继续执行完任务队列中的任务

任务线程不变，在线程池关闭之前再提交一个新任务，这个任务在LinkedBlockingQueue中

```java
public class Main {
    public static void main(String[] args) {
        ThreadPoolExecutor threadPool = new ThreadPoolExecutor(1, 1, 0L,
                TimeUnit.SECONDS,
                new LinkedBlockingQueue<>(1),
                new ThreadPoolExecutor.AbortPolicy());
        try {
            threadPool.execute(new Task(1));
            threadPool.execute(new Task(3));
        } catch (RejectedExecutionException e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
            threadPool.execute(new Task(2));
        }
    }
}
```

输出：

> Exception in thread "main" java.util.concurrent.RejectedExecutionException: Task com.neko.juc38.Task@568db2f2 rejected from java.util.concurrent.ThreadPoolExecutor@378bf509[Shutting down, pool size = 1, active threads = 1, queued tasks = 1, completed tasks = 0]
> 	at java.base/java.util.concurrent.ThreadPoolExecutor$AbortPolicy.rejectedExecution(ThreadPoolExecutor.java:2065)
> 	at java.base/java.util.concurrent.ThreadPoolExecutor.reject(ThreadPoolExecutor.java:833)
> 	at java.base/java.util.concurrent.ThreadPoolExecutor.execute(ThreadPoolExecutor.java:1365)
> 	at com.neko.juc38.Main.main(Main.java:21)
> pool-1-thread-1: 1
> pool-1-thread-1: 3

发现在关闭线程池后，线程池中的和等待队列中的线程都被执行了

##### shutdownNow

立即关闭线程池，不再接收新任务，返回任务队列中的任务

总结起来就是上面三点：

1. 立即关闭线程池
2. 不再接收新任务
3. 返回任务队列中的任务

**shutdownNow只在需要立即关闭线程池的时候使用**

|                            | shutdown | shutdownNow |
| :------------------------: | :------: | :---------: |
|       立即关闭线程池       |    X     |      O      |
|       延时关闭线程池       |    O     |      X      |
|       不再接收新任务       |    O     |      O      |
| 继续执行完任务队列中的任务 |    O     |      X      |
|    返回任务队列中的任务    |    X     |      O      |
|         线程池状态         | SHUTDOWN |    STOP     |

这个方法返回一个未执行完的线程列表

```java
public List<Runnable> shutdownNow() {
    List<Runnable> tasks;
    final ReentrantLock mainLock = this.mainLock;
    mainLock.lock();
    try {
        checkShutdownAccess();
        advanceRunState(STOP);
        interruptWorkers();		// 在这里中断所有线程
        tasks = drainQueue();
    } finally {
        mainLock.unlock();
    }
    tryTerminate();
    return tasks;
}
```

这是interruptWorkers的具体实现，其对每个线程调用interruptIfStarted方法

```java
private void interruptWorkers() {
    // assert mainLock.isHeldByCurrentThread();
    for (Worker w : workers)
        w.interruptIfStarted();
}
```

这是interruptIfStarted的具体实现，其对每个线程调用中断方法。假如线程中没有判断中断标记，那么这个线程就停不下来

```java
void interruptIfStarted() {
    Thread t;
    if (getState() >= 0 && (t = thread) != null && !t.isInterrupted()) {
        try {
            t.interrupt();
        } catch (SecurityException ignore) {
        }
    }
}
```

##### 演示

任务线程保持不变，主线程使用shutdownNow

```java
public class Main {
    public static void main(String[] args) {
        ExecutorService threadPool = Executors.newSingleThreadExecutor();
        threadPool.execute(new Task(1));
        threadPool.execute(new Task(2));
        threadPool.execute(new Task(3));
        List<Runnable> tasks = threadPool.shutdownNow();
        for (Runnable task : tasks) {
            task.run();
        }
    }
}
```

输出：

> pool-1-thread-1: 1
> main: 2
> main: 3

说明shutdownNow返回了等待队列中的线程

修改任务线程为死循环，这样中断后会一直执行

```java
public class Task implements Runnable {

    private final int index;

    public Task(int index) {
        this.index = index;
    }

    @Override
    public void run() {
        for (;;) {
            System.out.println(Thread.currentThread().getName() + ": " + index);
        }
    }
}
```

输出：

> ......
>
> pool-1-thread-1: 1
> pool-1-thread-1: 1
> pool-1-thread-1: 1
> pool-1-thread-1: 1
> pool-1-thread-1: 1
> pool-1-thread-1: 1
> pool-1-thread-1: 1
> pool-1-thread-1: 1
>
> ......

继续修改，在循环里判断是否中断，然后直接返回

```java
public class Task implements Runnable {

    private final int index;

    public Task(int index) {
        this.index = index;
    }

    @Override
    public void run() {
        for (;;) {
            if (Thread.interrupted()) {
                return;
            }
            System.out.println(Thread.currentThread().getName() + ": " + index);
        }
    }
}
```

没有输出，因为被立刻关闭了



#### 线程池状态及生命周期

ThreadPoolExecutor中定义了线程池状态

```java
public class ThreadPoolExecutor extends AbstractExecutorService {
	// runState is stored in the high-order bits
    private static final int RUNNING    = -1 << COUNT_BITS;
    private static final int SHUTDOWN   =  0 << COUNT_BITS;
    private static final int STOP       =  1 << COUNT_BITS;
    private static final int TIDYING    =  2 << COUNT_BITS;
    private static final int TERMINATED =  3 << COUNT_BITS;
}
```

|    状态    |                             描述                             |
| :--------: | :----------------------------------------------------------: |
|  RUNNING   |         可以接收新任务，并且也能处理任务队列中的任务         |
|  SHUTDOWN  |           不接收新任务，但可以处理任务队列中的任务           |
|    STOP    | 不接收新任务，也不处理任务队列中的任务，还中断正在处理任务的线程 |
|  TIDYING   |            所有任务已终止，线程池中的线程数量为0             |
| TERMINATED |                        线程池彻底关闭                        |

![ThreadPoolLifeCycle](../../../../images/posts/2025/08/multithread/pics/ThreadPoolLifeCycle.png)



#### 线程池如何执行任务？

##### 提交任务

提交任务有两种方式，分别是没有返回值的execute和有返回值的submit

submit定义在抽象类AbstractExecutorService中，最终也要调用execute

```java
public abstract class AbstractExecutorService implements ExecutorService {
	public Future<?> submit(Runnable task) {
        if (task == null) throw new NullPointerException();
        RunnableFuture<Void> ftask = newTaskFor(task, null);
        execute(ftask);
        return ftask;
    }
}
```

execute定义在ThreadPoolExecutor中

```java
public void execute(Runnable command) {
    if (command == null)
        throw new NullPointerException();
    /*
     * Proceed in 3 steps:
     *
     * 1. If fewer than corePoolSize threads are running, try to
     * start a new thread with the given command as its first
     * task.  The call to addWorker atomically checks runState and
     * workerCount, and so prevents false alarms that would add
     * threads when it shouldn't, by returning false.
     *
     * 2. If a task can be successfully queued, then we still need
     * to double-check whether we should have added a thread
     * (because existing ones died since last checking) or that
     * the pool shut down since entry into this method. So we
     * recheck state and if necessary roll back the enqueuing if
     * stopped, or start a new thread if there are none.
     *
     * 3. If we cannot queue task, then we try to add a new
     * thread.  If it fails, we know we are shut down or saturated
     * and so reject the task.
     */
    int c = ctl.get();
    if (workerCountOf(c) < corePoolSize) {
        if (addWorker(command, true))
            return;
        c = ctl.get();
    }
    if (isRunning(c) && workQueue.offer(command)) {
        int recheck = ctl.get();
        if (! isRunning(recheck) && remove(command))
            reject(command);
        else if (workerCountOf(recheck) == 0)
            addWorker(null, false);
    }
    else if (!addWorker(command, false))
        reject(command);
}
```

##### 判断3次

分成3步：

首先，如果正在运行的线程数小于核心线程数，就把这个线程添加到核心线程中运行

workerCountOf获取当前线程池中的核心线程数。addWorker向线程池中添加线程，第一个参数是要添加的线程，第二个参数是是否为核心线程，true是核心线程。ctl.get获取线程池状态和线程数

```java
if (workerCountOf(c) < corePoolSize) {
    if (addWorker(command, true))
        return;
    c = ctl.get();
}
```

假如核心线程满了，就把当前线程放到任务队列中

isRunning判断线程池是否还在运行，workQueue.offer将当前线程放入任务队列。recheck再次获取状态并检查线程池是否还在运行，没在运行就拒绝；在运行还要判断线程池中的核心线程数是否为0，是就创建一个非核心线程，不是就向下走

```java
if (isRunning(c) && workQueue.offer(command)) {
    int recheck = ctl.get();
    if (! isRunning(recheck) && remove(command))
        reject(command);
    else if (workerCountOf(recheck) == 0)
        addWorker(null, false);
}
```

如果任务队列也满了，或线程池容量满了，就直接拒绝

```java
else if (!addWorker(command, false))
    reject(command);
```

![ThreadPoolExecute](../../../../images/posts/2025/08/multithread/pics/ThreadPoolExecute.png)



#### 批量执行任务

##### 定义

在AbstractExecutorService抽象类中，定义了invokeAny和invokeAll两种方法

|                             方法                             |                             描述                             |
| :----------------------------------------------------------: | :----------------------------------------------------------: |
| List<Future\<T>> invokeAll(Collection<? extends Callable\<T>> tasks) |               执行批量任务，返回它们的执行结果               |
| List<Future\<T>> invokeAll(Collection<? extends Callable\<T>> tasks, long timeout, TimeUnit unit) | 执行批量任务，返回指定时间内完成的执行结果，取消未完成的任务 |
|    T invokeAny(Collection<? extends Callable\<T>> tasks)     |             执行批量任务，返回最先完成的执行结果             |
| T invokeAny(Collection<? extends Callable\<T>> tasks, long timeout, TimeUnit unit) | 执行批量任务，返回指定时间内最先完成的执行结果，取消未完成的任务 |

##### invokeAll

用一个集合存储所有要运行的任务，用一个返回泛型的Future列表接收执行结果

任务是睡1秒然后返回index

```java
public class Task implements Callable<Integer> {

    private final int index;

    public Task(int index) {
        this.index = index;
    }

    @Override
    public Integer call() throws Exception {
        Thread.sleep(1000);
        return index;
    }
}
```

主线程里唤醒所有任务，再接收执行结果

```java
public class Main {
    public static void main(String[] args) {
        List<Task> tasks = new ArrayList<>();
        for (int i = 1; i <= 10; ++i) {
            tasks.add(new Task(i));
        }
        ExecutorService threadPool = Executors.newFixedThreadPool(5);
        try {
            List<Future<Integer>> futures = threadPool.invokeAll(tasks);
            for (Future<Integer> future : futures) {
                System.out.println(future.get());
            }
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
        }
    }
}
```

输出：

> 1
> 2
> 3
> 4
> 5
> 6
> 7
> 8
> 9
> 10

##### 超时

invokeAny和invokeAll都提供了超时方法，在时间限制内执行任务，把没执行的任务全部取消

修改主线程中的invokeAll方法，使超时为1秒

```java
public class Main {
    public static void main(String[] args) {
        List<Task> tasks = new ArrayList<>();
        for (int i = 1; i <= 10; ++i) {
            tasks.add(new Task(i));
        }
        ExecutorService threadPool = Executors.newFixedThreadPool(5);
        try {
            List<Future<Integer>> futures = threadPool.invokeAll(tasks, 1, TimeUnit.SECONDS);
            for (Future<Integer> future : futures) {
                System.out.println(future.get());
            }
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
        }
    }
}
```

输出：

> 1
> 2
> 3
> 4
> 5
> Exception in thread "main" java.util.concurrent.CancellationException
> 	at java.base/java.util.concurrent.FutureTask.report(FutureTask.java:121)
> 	at java.base/java.util.concurrent.FutureTask.get(FutureTask.java:191)
> 	at com.neko.juc40.Main.main(Main.java:17)

##### invokeAny

invokeAny返回最先执行完的第一个结果

修改主线程为invokeAny

```java
public class Main {
    public static void main(String[] args) {
        List<Task> tasks = new ArrayList<>();
        for (int i = 1; i <= 10; ++i) {
            tasks.add(new Task(i));
        }
        ExecutorService threadPool = Executors.newFixedThreadPool(5);
        try {
            Integer result = threadPool.invokeAny(tasks);
            System.out.println(result);
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
        }
    }
}
```

输出：

> 1



#### 执行定时、延时任务

##### 定义

在接口ScheduledExecutorService中定义了schedule方法

```java
public interface ScheduledExecutorService extends ExecutorService {

    // 延时执行Runnable任务，只执行一次
    public ScheduledFuture<?> schedule(Runnable command, long delay, TimeUnit unit);
    
    public <V> ScheduledFuture<V> schedule(Callable<V> callable, long delay, TimeUnit unit);
    
    public ScheduledFuture<?> scheduleAtFixedRate(Runnable command, long initialDelay, long period, TimeUnit unit);
    
    public ScheduledFuture<?> scheduleWithFixedDelay(Runnable command, long initialDelay, long delay, TimeUnit unit);
    
}
```

ScheduledThreadPoolExecutor继承了ThreadPoolExecutor的方法并实现了ScheduledExecutorService接口，可以通过下面这四个构造函数创建调度线程池

```java
public class ScheduledThreadPoolExecutor extends ThreadPoolExecutor implements ScheduledExecutorService {

    public ScheduledThreadPoolExecutor(int corePoolSize) {}

    public ScheduledThreadPoolExecutor(int corePoolSize, ThreadFactory threadFactory) {}

    public ScheduledThreadPoolExecutor(int corePoolSize, RejectedExecutionHandler handler) {}

    public ScheduledThreadPoolExecutor(int corePoolSize, ThreadFactory threadFactory, RejectedExecutionHandler handler) {}

}
```

还可以通过Executors创建

```java
public class Executors {

    // 创建池中只有一个线程的调度线程池
    public static ScheduledExecutorService newSingleThreadScheduledExecutor() {}

    // 创建池中只有一个线程的调度线程池，并指定线程工厂
    public static ScheduledExecutorService newSingleThreadScheduledExecutor(ThreadFactory threadFactory) {}
    
    // 创建指定核心线程数的调度线程池
    public static ScheduledExecutorService newScheduledThreadPool(int corePoolSize) {}

    // 创建指定核心线程数的调度线程池，并指定线程工厂
    public static ScheduledExecutorService newScheduledThreadPool(int corePoolSize, ThreadFactory threadFactory) {}

}
```

##### schedule Runnable

写一个任务，打印当前时间

```java
public class Task implements Runnable {
    @Override
    public void run() {
        System.out.println(LocalTime.now());
    }
}
```

主线程创建一个调度线程池，调用schedule让线程池中的任务等待3秒再运行

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        ScheduledExecutorService scheduledThreadPool = Executors.newScheduledThreadPool(5);
        System.out.println(LocalTime.now());
        scheduledThreadPool.schedule(task, 3, TimeUnit.SECONDS);
        scheduledThreadPool.shutdown();
    }
}
```

输出：

> 00:40:36.213038700
> 00:40:39.225959600

##### schedule Callable

更改一下任务，从Runnable改为Callable

```java
public class ResultTask implements Callable<String> {
    @Override
    public String call() throws Exception {
        return LocalTime.now().toString();
    }
}
```

主线程接收返回值

```java
public class Main {
    public static void main(String[] args) {
        ResultTask task = new ResultTask();
        ScheduledExecutorService scheduledThreadPool = Executors.newScheduledThreadPool(5);
        System.out.println(LocalTime.now());
        ScheduledFuture<String> future = scheduledThreadPool.schedule(task, 3, TimeUnit.SECONDS);
        try {
            System.out.println(future.get());
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        } finally {
            scheduledThreadPool.shutdown();
        }
    }
}
```

输出：

> 00:49:59.969231200
> 00:50:02.977473400



#### 执行周期、重复性任务

##### 定义

周期、重复性任务指隔一段时间就执行一次的任务，在接口ScheduledExecutorService中定义了scheduleAtFixedRate方法，执行周期性任务，周期为固定时间；和scheduleWithFixedDelay方法，执行周期性任务，周期为间隔时间

```java
public interface ScheduledExecutorService extends ExecutorService {

	// 延时执行Runnable任务，只执行一次
	public ScheduledFuture<?> schedule(Runnable command, long delay, TimeUnit unit);

	public <V> ScheduledFuture<V> schedule(Callable<V> callable, long delay, TimeUnit unit);

    // 执行周期性任务，周期为固定时间
	public ScheduledFuture<?> scheduleAtFixedRate(Runnable command, long initialDelay, long period, TimeUnit unit);
	
    // 执行周期性任务，周期为间隔时间
	public ScheduledFuture<?> scheduleWithFixedDelay(Runnable command, long initialDelay, long delay, TimeUnit unit);

}
```

##### scheduleAtFixedRate

首先写一个任务，打印当前时间并睡1秒模拟执行时长

```java
public class Task implements Runnable {
    @Override
    public void run() {
        System.out.println(LocalTime.now());
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

主线程中执行周期性任务，周期为固定时间

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        ScheduledExecutorService scheduledThreadPool = Executors.newScheduledThreadPool(5);
        System.out.println(LocalTime.now());
        ScheduledFuture<?> future = scheduledThreadPool.scheduleAtFixedRate(task, 1, 1, TimeUnit.SECONDS);
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        future.cancel(false);
        scheduledThreadPool.shutdown();
    }
}
```

输出：

> 01:02:53.176367200
> 01:02:54.187635600
> 01:02:55.193872
> 01:02:56.208584300
> 01:02:57.215126600

##### scheduleWithFixedDelay

任务不变，修改主线程变为scheduleWithFixedDelay

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task();
        ScheduledExecutorService scheduledThreadPool = Executors.newScheduledThreadPool(5);
        System.out.println(LocalTime.now());
        ScheduledFuture<?> future = scheduledThreadPool.scheduleWithFixedDelay(task, 1, 1, TimeUnit.SECONDS);
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        future.cancel(false);
        scheduledThreadPool.shutdown();
    }
}
```

输出：

> 01:09:31.638803100
> 01:09:32.641190800
> 01:09:34.660508

##### 区别

![schedule](../../../../images/posts/2025/08/multithread/pics/schedule.png)



#### ForkJoin框架

##### 定义

ForkJoin是一个把大任务分割成若干个小任务，再对每个小任务得到的结果进行汇总，得到大任务结果的框架

![ForkJoin](../../../../images/posts/2025/08/multithread/pics/ForkJoin.png)

##### ForkJoinPool

ForkJoinPool继承自AbstractExecutorService，拥有线程池的基本功能

```java
public class ForkJoinPool extends AbstractExecutorService
```

![ForkJoinPool](../../../../images/posts/2025/08/multithread/pics/ForkJoinPool.png)

|       类        |       描述       |
| :-------------: | :--------------: |
|  ForkJoinPool   |  ForkJoin线程池  |
|  ForkJoinTask   | 职责相当于Future |
|  RecursiveTask  |   有返回值任务   |
| RecursiveAction |   无返回值任务   |

写一个递归任务，二分地计算1加到100的和

```java
public class Task extends RecursiveTask<Integer> {

    private int start;

    private int end;

    private int threshold = 10;

    public Task(int start, int end) {
        this.start = start;
        this.end = end;
    }

    @Override
    protected Integer compute() {
        if ((end - start) < threshold) {
            int sum = 0;
            for (int i = start; i <= end; i++) {
                sum += i;
            }
            return sum;
        } else {
            int middle = (start + end) / 2;
            Task task1 = new Task(start, middle);
            task1.fork();
            Task task2 = new Task(middle + 1, end);
            task2.fork();
            return task1.join() + task2.join();
        }
    }
}
```

主线程创建ForkJoinPool线程池，然后提交任务

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task(1, 100);
        ForkJoinPool threadPool = new ForkJoinPool();
        ForkJoinTask<Integer> future = threadPool.submit(task);
        try {
            Integer result = future.get();
            System.out.println(result);
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
        }
    }
}
```

输出：

> 5050



#### CompletionService

##### 定义

按照任务完成时间的先后顺序返回结果，先执行完先返回

```java
public class ExecutorCompletionService<V> implements CompletionService<V>
```

有下面几个接口

|                     方法                     |                    描述                    |
| :------------------------------------------: | :----------------------------------------: |
|     Future\<V> submit(Callable\<V> task)     |              提交Callable任务              |
|  Future\<V> submit(Runnable task, V result)  |    提交Runnable任务，并指定任务执行结果    |
|              Future\<V> take()               |           阻塞式获取任务执行结果           |
|              Future\<V> poll()               |  非阻塞式获取任务执行结果，无结果返回null  |
| Future\<V> poll(long timeout, TimeUnit unit) | 指定时间内获取任务执行结果，无结果返回null |

##### ExecutorCompletionService

任务

```java
public class Task implements Callable<Integer> {

    private int timeout;

    public Task(int timeout) {
        this.timeout = timeout;
    }

    @Override
    public Integer call() throws Exception {
        System.out.println(timeout);
        Thread.sleep(timeout * 100L);
        return timeout;
    }
}
```

主线程

```java
public class Main {
    public static void main(String[] args) {
        ExecutorService threadPool = Executors.newFixedThreadPool(5);
        ExecutorCompletionService<Integer> completionService = new ExecutorCompletionService<>(threadPool);
        for (int i = 5; i >= 1; --i) {
            Task task = new Task(i);
            completionService.submit(task);
        }
        try {
            for (int i = 0; i < 5; ++i) {
                Future<Integer> future = completionService.take();
                int result = future.get();
                System.out.println(result);
            }
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
        }
    }
}
```

输出：

> 5
> 3
> 1
> 2
> 4
> 1
> 2
> 3
> 4
> 5



#### 监控线程池

##### 定义

在ThreadPoolExecutor中定义了获取线程池状态的方法

|                方法                 |         描述         |
| :---------------------------------: | :------------------: |
|        int getActiveCount()         | 获取正在工作的线程数 |
|          int getPoolSize()          | 获取当前存在的线程数 |
|      int getLargestPoolSize()       | 获取历史最大的线程数 |
|         long getTaskCount()         |  获取已提交的任务数  |
|    long getCompletedTaskCount()     |  获取已完成的任务数  |
| BlockingQueue\<Runnable> getQueue() |     获取任务队列     |

##### MonitorThreadPool

监控线程池

```java
public class MonitorThreadPool extends ThreadPoolExecutor {

    public MonitorThreadPool(int corePoolSize, int maximumPoolSize,
                             long keepAliveTime, TimeUnit unit,
                             BlockingQueue<Runnable> workQueue) {
        super(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue);
    }

    @Override
    protected void beforeExecute(Thread t, Runnable r) {
        monitor();
    }

    @Override
    protected void afterExecute(Runnable r, Throwable t) {
        monitor();
    }

    @Override
    protected void terminated() {
        monitor();
    }

    public void monitor() {
        System.out.println("正在工作的线程数：" + getActiveCount() + "\t");
        System.out.println("当前存在的线程数：" + getPoolSize() + "\t");
        System.out.println("历史最大线程数：" + getLargestPoolSize() + "\t");
        System.out.println("已提交的任务数：" + getTaskCount() + "\t");
        System.out.println("已完成的任务数：" + getCompletedTaskCount() + "\t");
        System.out.println("队列中的的任务数：" + getQueue().size() + "\t");
        System.out.println("=========================================");
    }
}
```

任务线程

```java
public class Task implements Runnable {

    private int timeout;

    public Task(int timeout) {
        this.timeout = timeout;
    }

    @Override
    public void run() {
        try {
            Thread.sleep(timeout * 1000L);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

主线程

```java
public class Main {
    public static void main(String[] args) {
        MonitorThreadPool threadPool = new MonitorThreadPool(1, 3, 0,
                                                             TimeUnit.SECONDS,
                                                             new LinkedBlockingQueue<>(2));
        try {
            for (int i = 5; i > 0; --i) {
                Task task = new Task(i);
                threadPool.submit(task);
                Thread.sleep(500);
            }
            Thread.sleep(6000);
            threadPool.monitor();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
        }
    }
}
```

输出：

```
正在工作的线程数：1	
当前存在的线程数：1	
历史最大线程数：1	
已提交的任务数：1	
已完成的任务数：0	
队列中的的任务数：0	
=========================================
5
正在工作的线程数：1	
当前存在的线程数：1	
历史最大线程数：1	
已提交的任务数：2	
已完成的任务数：0	
队列中的的任务数：1	
=========================================
正在工作的线程数：1	
当前存在的线程数：1	
历史最大线程数：1	
已提交的任务数：2	
已完成的任务数：1	
队列中的的任务数：0	
=========================================
4
正在工作的线程数：1	
当前存在的线程数：1	
历史最大线程数：1	
已提交的任务数：2	
已完成的任务数：1	
队列中的的任务数：0	
=========================================
正在工作的线程数：1	
当前存在的线程数：1	
历史最大线程数：1	
已提交的任务数：3	
已完成的任务数：2	
队列中的的任务数：0	
=========================================
3
正在工作的线程数：1	
当前存在的线程数：1	
历史最大线程数：1	
已提交的任务数：3	
已完成的任务数：2	
队列中的的任务数：0	
=========================================
正在工作的线程数：1	
当前存在的线程数：1	
历史最大线程数：1	
已提交的任务数：4	
已完成的任务数：3	
队列中的的任务数：0	
=========================================
2
正在工作的线程数：1	
当前存在的线程数：1	
历史最大线程数：1	
已提交的任务数：4	
已完成的任务数：3	
队列中的的任务数：0	
=========================================
正在工作的线程数：1	
当前存在的线程数：1	
历史最大线程数：1	
已提交的任务数：5	
已完成的任务数：4	
队列中的的任务数：0	
=========================================
1
正在工作的线程数：1	
当前存在的线程数：1	
历史最大线程数：1	
已提交的任务数：5	
已完成的任务数：4	
队列中的的任务数：0	
=========================================
正在工作的线程数：0	
当前存在的线程数：1	
历史最大线程数：1	
已提交的任务数：5	
已完成的任务数：5	
队列中的的任务数：0	
=========================================
正在工作的线程数：0	
当前存在的线程数：0	
历史最大线程数：1	
已提交的任务数：5	
已完成的任务数：5	
队列中的的任务数：0	
=========================================
```



#### 线程池间共享ThreadLocal

##### TransmittableThreadLocal

用来传递线程池之间的本地变量，是阿里巴巴写的一个库，[GitHub地址](https://github.com/alibaba/transmittable-thread-local)

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>transmittable-thread-local</artifactId>
    <version>2.14.4</version>
</dependency>
```

与ThreadLocal拥有一样的方法

|                           方法名                            |                   描述                    |
| :---------------------------------------------------------: | :---------------------------------------: |
| ThreadLocal\<S> withInitial(Supplier<? extends S> supplier) |  创建ThreadLocal实例，并提供初始值构造器  |
|                           T get()                           | 获取ThreadLocal在当前线程中保存的变量副本 |
|                      void set(T value)                      | 设置ThreadLocal在当前线程中保存的变量副本 |
|                        void remove()                        | 删除ThreadLocal在当前线程中保存的变量副本 |

写一个套娃线程，线程task里面套了线程r，在task里设置线程本地变量，在r里获取线程本地变量，然后在task里提交r到线程池。原版程序有些问题，修改了一下让线程池关闭。然后又还原回原版代码，因为不能过早让线程池关闭，虽然这样写有些离谱，但是演示程序就这样吧

```java
public class Main {
    public static void main(String[] args) {
        ExecutorService threadPool = Executors.newFixedThreadPool(1);
        ThreadLocal<String> tl = new ThreadLocal<>();
        Runnable task = new Runnable() {
            @Override
            public void run() {
                String name = Thread.currentThread().getName();
                System.out.println(name);
                tl.set(name);
                Runnable r = new Runnable() {
                    @Override
                    public void run() {
                        System.out.println(tl.get());
                    }
                };
                threadPool.execute(r);
            }
        };
        Thread thread0 = new Thread(task);
        Thread thread1 = new Thread(task);
        thread0.start();
        thread1.start();
    }
}
```

输出：

> Thread-0
> Thread-1
> null
> null

说明ThreadLocal有线程隔离性质

修改ThreadLocal为InheritableThreadLocal

```java
InheritableThreadLocal<String> tl = new InheritableThreadLocal<>();
```

输出：

> Thread-0
> Thread-1
> Thread-0
> Thread-1

数据不一致，说明InheritableThreadLocal不能在线程池之间共享

修改InheritableThreadLocal为TransmittableThreadLocal

```java
TransmittableThreadLocal<String> tl = new TransmittableThreadLocal<>();
```

输出：

> Thread-0
> Thread-1
> Thread-1
> Thread-1

出现这种情况是因为不能只将ThreadLocal改为TransmittableThreadLocal，后续还需要对线程进行封装

```java
public class Main {
    public static void main(String[] args) {
        ExecutorService threadPool = Executors.newFixedThreadPool(1);
        TransmittableThreadLocal<String> tl = new TransmittableThreadLocal<>();
        Runnable task = new Runnable() {
            @Override
            public void run() {
                String name = Thread.currentThread().getName();
                System.out.println(name);
                tl.set(name);
                Runnable r = new Runnable() {
                    @Override
                    public void run() {
                        System.out.println(tl.get());
                    }
                };
                TtlRunnable ttlRunnable = TtlRunnable.get(r);
                threadPool.execute(ttlRunnable);
            }
        };
        Thread thread0 = new Thread(task);
        Thread thread1 = new Thread(task);
        thread0.start();
        thread1.start();
    }
}
```

或对线程池进行转换，就不需要包装线程

```java
public class Main {
    public static void main(String[] args) {
        ExecutorService executorService = Executors.newFixedThreadPool(1);
        ExecutorService threadPool = TtlExecutors.getTtlExecutorService(executorService);
        TransmittableThreadLocal<String> tl = new TransmittableThreadLocal<>();
        Runnable task = new Runnable() {
            @Override
            public void run() {
                String name = Thread.currentThread().getName();
                System.out.println(name);
                tl.set(name);
                Runnable r = new Runnable() {
                    @Override
                    public void run() {
                        System.out.println(tl.get());
                    }
                };
                threadPool.execute(r);
            }
        };
        Thread thread0 = new Thread(task);
        Thread thread1 = new Thread(task);
        thread0.start();
        thread1.start();
    }
}
```

输出：

> Thread-0
> Thread-1
> Thread-0
> Thread-1

##### 区别

|                          | 本地 | 线程间共享 | 线程池间共享 |
| :----------------------: | :--: | :--------: | :----------: |
|       ThreadLocal        |  O   |     X      |      X       |
|  InheritableThreadLocal  |  O   |     O      |      X       |
| TransmittableThreadLocal |  O   |     O      |      O       |



#### 内存可见性

##### 定义

|        |                             描述                             |
| :----: | :----------------------------------------------------------: |
|  可见  | 多个线程共享变量时，其中一个线程修改其变量的值，其他线程及时得到最新值 |
| 不可见 | 多个线程共享变量时，其中一个线程修改其变量的值，其他线程无法及时得到最新值 |

每个线程都有其工作内存，工作内存中缓存了从主内存取得的变量副本，每次线程操作如果能从工作内存读取，就不会去主内存中读取

volatile关键字用来修饰变量，表明变量必须同步地发生变化，解决了内存可见性问题

##### volatile

编写下面一个程序，线程中使用外部的变量控制循环，主线程中睡1秒后改变变量

```java
public class Main {

    public static boolean stopped = false;

    public static void main(String[] args) {
        Thread thread = new Thread() {
            @Override
            public void run() {
                while (!stopped);
            }
        };
        thread.start();
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        stopped = true;
    }
}
```

程序停不下来，一直在死循环。原因是主线程修改了stopped值，更新了主线程的工作内存和主内存，但是任务线程仍然从它自己的工作内存缓存中读取stopped值，这个值并未被更新，于是停不下来

用volatile关键字修饰stopped变量

```java
public static volatile boolean stopped = false;
```

程序成功在1秒后停止



#### 原子性

##### 定义

一个或多个操作是不可中断的，要么全部执行成功，要么全部执行失败

例子：A和B账户各有200，A向B转账100

下面两个步骤必须全部成功，转账的操作才算成功

* A账户-100
* B账户+100

失败1：A-100，B未+100

失败2：A未-100，B+100

失败3：A账户突然变成800

下面这段程序创建了10个线程，每个线程输出i++之前睡了100毫秒

```java
public class Main {

    private static int i = 0;

    public static void main(String[] args) {
        Runnable task = new Runnable() {
            @Override
            public void run() {
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(i++);
            }
        };
        for (int j = 0; j < 10; ++j) {
            Thread thread = new Thread(task);
            thread.start();
        }
    }
}
```

输出：

> 0
> 3
> 2
> 0
> 5
> 0
> 1
> 4
> 0
> 0

说明i++不是原子操作，是分成下面3个操作

1. 从主内存读取变量i
2. 执行i++
3. 将变量i写入主内存

##### volatile不能解决原子性问题

用volatile关键字修饰变量

```java
private static volatile int i = 0;
```

输出：

> 2
> 3
> 7
> 1
> 5
> 6
> 0
> 0
> 4
> 0

##### 同步能解决原子性问题

用synchronized关键字包围i++

```java
synchronized (this) {
    System.out.println(i++);
}
```

输出：

> 0
> 1
> 2
> 3
> 4
> 5
> 6
> 7
> 8
> 9

##### 原子类能解决原子性问题

把i变为原子类，然后调用原子类的自增方法

```java
public class Main {

    private static AtomicInteger i = new AtomicInteger(0);

    public static void main(String[] args) {
        Runnable task = new Runnable() {
            @Override
            public void run() {
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(i.getAndIncrement());
            }
        };
        for (int j = 0; j < 10; ++j) {
            Thread thread = new Thread(task);
            thread.start();
        }
    }
}
```

输出：

> 0
> 7
> 3
> 4
> 8
> 2
> 5
> 1
> 6
> 9



#### 比较并交换CAS技术

##### CompareAndSwap

CAS操作包含三个操作数：内存值、预期原值和新值。如果内存位置的值与预期原值相匹配，那么将内存值更新为新值；否则什么都不做

下面是一个给内存值加入干扰的例子，因为主线程和任务线程都睡了100毫秒，所以不知道i+1读取的i是被刷进主内存的5还是原本的0

```java
public class Main {

    public static int i = 0;

    public static void main(String[] args) {
        Thread thread = new Thread() {
            @Override
            public void run() {
                System.out.println(i);
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                i = i + 1;
                System.out.println(i);
            }
        };
        thread.start();
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        i = 5;
    }
}
```

有可能输出0 1，也有可能输出0 6

CAS通过比较内存值和预期原值来决定是否将新值赋值给内存

|        比较        |     交换      |
| :----------------: | :-----------: |
| 内存值 == 预期原值 | 内存值 = 新值 |
| 内存值 != 预期原值 |       X       |

##### 示例

在下面写一个静态方法，判断旧值是否和预期值一致，一致就赋新值并返回true，不一致就返回false

```java
public class Main {

    public static int i = 0;

    public static void main(String[] args) {
        Thread thread = new Thread() {
            @Override
            public void run() {
                int oldValue = i;
                System.out.println(oldValue);
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                boolean result = compareAndSwap(i, oldValue, i + 1);
                System.out.println(result);
                System.out.println(i);
            }
        };
        thread.start();
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        i = 5;
    }

    public static boolean compareAndSwap(int oldValue, int expectedValue, int newValue) {
        if (expectedValue == oldValue) {
            i = newValue;
            return true;
        }
        return false;
    }
}
```

这段程序执行既有可能输出0 true 1，又有可能输出0 false 5，还有可能输出0 true 5

由于0 true 5不应该出现，所以这个比较也许不太有用，就当个案例看吧

0 true 5出现的原因：compareAndSwap函数返回true后执行了i=5的赋值

原子类里面CAS用的比较多



#### 原子类

##### 分类

具有原子性的类，共有12个

|               类名                |            描述            |
| :-------------------------------: | :------------------------: |
|           AtomicBoolean           |     boolean类型原子类      |
|           AtomicInteger           |       int类型原子类        |
|            AtomicLong             |       long类型原子类       |
|        AtomicReference\<V>        |       引用类型原子类       |
|        AtomicIntegerArray         |     int数组类型原子类      |
|          AtomicLongArray          |     long数组类型原子类     |
|     AtomicReferenceArray\<E>      |     引用类型数组原子类     |
|   AtomicIntegerFieldUpdater\<T>   |   int类型字段原子更新器    |
|    AtomicLongFieldUpdater\<T>     |   long类型字段原子更新器   |
| AtomicReferenceFieldUpdater\<T,V> |     引用类型字段更新器     |
|    AtomicMarkableReference\<V>    | 带修改标记的引用类型原子类 |
|    AtomicStampedReference\<V>     |  带版本号的引用类型原子类  |

按类型分类

|    基本/引用类型    |         数组类型         |            字段更新器             |
| :-----------------: | :----------------------: | :-------------------------------: |
|    AtomicBoolean    |    AtomicIntegerArray    |   AtomicIntegerFieldUpdater\<T>   |
|    AtomicInteger    |     AtomicLongArray      |    AtomicLongFieldUpdater\<T>     |
|     AtomicLong      | AtomicReferenceArray\<E> | AtomicReferenceFieldUpdater\<T,V> |
| AtomicReference\<V> |                          |                                   |

##### AtomicBoolean

![AtomicBoolean](../../../../images/posts/2025/08/multithread/pics/AtomicBoolean.png)

|                            方法名                            |                 描述                 |
| :----------------------------------------------------------: | :----------------------------------: |
|                       AtomicBoolean()                        | 创建AtomicBoolean对象，初始值为false |
|             AtomicBoolean(boolean initialValue)              |  创建指定初始值的AtomicBoolean对象   |
|                        boolean get()                         |               获取数据               |
|                  void set(boolean newValue)                  |               设置数据               |
|             boolean getAndSet(boolean newValue)              |        先返回数据，再设置数据        |
| boolean compareAndSet(boolean expectedValue, boolean newValue) |       以CAS算法的形式更新数据        |

之前的任务

```java
public class Main {

    public static AtomicBoolean stopped = new AtomicBoolean(false);

    public static void main(String[] args) {
        Thread thread = new Thread() {
            @Override
            public void run() {
                while (!stopped.get());
            }
        };
        thread.start();
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        stopped.set(true);
    }
}
```

##### AtomicInteger和AtomicLong

![AtomicInteger](../../../../images/posts/2025/08/multithread/pics/AtomicInteger.png)

|                         方法名                         |               描述                |
| :----------------------------------------------------: | :-------------------------------: |
|                    AtomicInteger()                     | 创建AtomicInteger对象，初始值为0  |
|            AtomicInteger(int initialValue)             | 创建指定初始值的AtomicInteger对象 |
|                       int get()                        |             获取数据              |
|                 void set(int newValue)                 |             设置数据              |
|              int getAndSet(int newValue)               |      先返回数据，再设置数据       |
| boolean compareAndSet(int expectedValue, int newValue) |      以CAS算法的形式更新数据      |
|                 int getAndIncrement()                  |         递增数据，类似i++         |
|                 int getAndDecrement()                  |         递减数据，类似i--         |
|                 int incrementAndGet()                  |         递增数据，类似++i         |
|                 int decrementAndGet()                  |         递减数据，类似--i         |

AtomicLong除类型不同外，方法完全相同

##### AtomicReference

![AtomicReference](../../../../images/posts/2025/08/multithread/pics/AtomicReference.png)

|                            方法名                            |                 描述                  |
| :----------------------------------------------------------: | :-----------------------------------: |
|                      AtomicReference()                       | 创建AtomicReference对象，初始值为null |
|               AtomicReference(V initialValue)                |  创建指定初始值的AtomicReference对象  |
|                           V get()                            |               获取数据                |
|                     void set(V newValue)                     |               设置数据                |
|                   V getAndSet(V newValue)                    |        先返回数据，再设置数据         |
|      boolean compareAndSet(V expectedValue, V newValue)      |        以CAS算法的形式更新数据        |
|       V getAndUpdate(UnaryOperator\<V> updateFunction)       |     先返回数据，再自定义更新数据      |
|       V updateAndGet(UnaryOperator\<V> updateFunction)       |     先自定义更新数据，再返回数据      |
| V getAndAccumulate(V x, BinaryOperator\<V> accumulatorFunction) |     先返回数据，再自定义更新数据      |
| V accumulateAndGet(V x, BinaryOperator\<V> accumulatorFunction) |     先自定义更新数据，再返回数据      |

##### AtomicIntegerArray、AtomicLongArray和AtomicReferenceArray

![AtomicIntegerArray](../../../../images/posts/2025/08/multithread/pics/AtomicIntegerArray.png)

|                            方法名                            |                    描述                    |
| :----------------------------------------------------------: | :----------------------------------------: |
|                AtomicIntegerArray(int length)                |    创建指定长度的AtomicIntegerArray对象    |
|               AtomicIntegerArray(int[] array)                |  创建指定初始数组的AtomicIntegerArray对象  |
|                        int get(int i)                        |             获取指定位置的数据             |
|                void set(int i, int newValue)                 |             设置指定位置的数据             |
|              int getAndSet(int i, int newValue)              | 先返回指定位置的数据，再设置指定位置的数据 |
| boolean compareAndSet(int i, int expectedValue, int newValue) |     以CAS算法的形式更新指定位置的数据      |
|                         int length()                         |                获取数组长度                |
|                  int getAndIncrement(int i)                  |        递增指定位置的数据，类似i++         |
|                  int getAndDecrement(int i)                  |        递减指定位置的数据，类似i--         |
|                  int incrementAndGet(int i)                  |        递增指定位置的数据，类似++i         |
|                  int decrementAndGet(int i)                  |        递减指定位置的数据，类似--i         |

剩下的两个和之前的类似

##### AtomicIntegerFieldUpdater

![AtomicIntegerFieldUpdater](../../../../images/posts/2025/08/multithread/pics/AtomicIntegerFieldUpdater.png)

|                            方法名                            |               描述                |
| :----------------------------------------------------------: | :-------------------------------: |
|                        int get(T obj)                        |             获取数据              |
|                void set(T obj, int newValue)                 |             设置数据              |
|              int getAndSet(T obj, int newValue)              |      先返回数据，再设置数据       |
|     boolean compareAndSet(T obj, int expect, int update)     |      以CAS算法的形式更新数据      |
| AtomicIntegerFieldUpdater\<U> newUpdater(Class\<U> tclass, String fieldName) | 更新器，更新指定对象的int类型字段 |
|                  int getAndIncrement(T obj)                  |         递增数据，类似i++         |
|                  int getAndDecrement(T obj)                  |         递减数据，类似i--         |
|                  int incrementAndGet(T obj)                  |         递增数据，类似++i         |
|                  int decrementAndGet(T obj)                  |         递减数据，类似--i         |

剩下的两个和之前的类似

##### 用法

被更新字段必须是：

* public
* volatile

先写一个数据类

```java
public class Data {
    public volatile int id;
    public volatile String name;
}
```

主线程定义两个原子域更新器，一个整型一个字符串类型

```java
public class Main {
    public static void main(String[] args) {
        Data data = new Data();
        System.out.println(data.id + data.name);
        AtomicIntegerFieldUpdater<Data> idUpdater = AtomicIntegerFieldUpdater.newUpdater(Data.class, "id");
        AtomicReferenceFieldUpdater<Data, String> nameUpdater = AtomicReferenceFieldUpdater.newUpdater(Data.class, String.class, "name");
        idUpdater.set(data, 100);
        nameUpdater.set(data, "Neko");
        System.out.println(data.id + data.name);
    }
}
```

输出：

> 0null
> 100Neko



#### ABA问题

##### 定义

假如一个变量的值经历了下面的过程

```
A	--->	B	--->	A
^						^
|						|
预期值					 旧值
```

由于CAS只比较预期值和内存中的旧值，即使变量被中途修改也无法检测到

写一个带ABA问题的CAS

```java
public class Main {

    private static int i = 0;

    public static void main(String[] args) {
        Thread thread = new Thread() {
            @Override
            public void run() {
                int oldValue = i;
                System.out.println(oldValue);
                boolean result = compareAndSwap(oldValue, 0, 1);
                System.out.println(result);
                System.out.println(i);
            }
        };
        thread.start();
        i = 1;
        i = 0;
    }

    public static boolean compareAndSwap(int oldValue, int expectedValue, int newValue) {
        if (expectedValue == oldValue) {
            i = newValue;
            return true;
        }
        return false;
    }
}
```

输出：

> 0
> true
> 1

##### 解决

用原子类中的AtomicMarkableReference和AtomicStampedReference可以解决ABA问题

|            类名             |            描述            |
| :-------------------------: | :------------------------: |
| AtomicMarkableReference\<V> | 带修改标记的引用类型原子类 |
| AtomicStampedReference\<V>  |  带版本号的引用类型原子类  |

##### AtomicMarkableReference

![AtomicMarkableReference](../../../../images/posts/2025/08/multithread/pics/AtomicMarkableReference.png)

|                            方法名                            |                         描述                          |
| :----------------------------------------------------------: | :---------------------------------------------------: |
|  AtomicMarkableReference(V initialRef, boolean initialMark)  | 创建指定初始值和初始标记的AtomicMarkableReference对象 |
|                 V get(boolean[] markHolder)                  |      获取数据和标记，标记存储在数组第一个位置中       |
|          void set(V newReference, boolean newMark)           |                    设置数据和标记                     |
| boolean compareAndSet(V expectedReference, V newReference, boolean expectedMark, boolean newMark) |                以CAS方式更新数据和标记                |
|                      boolean isMarked()                      |                     获取当前标记                      |
|                       V getReference()                       |                       获取数据                        |
|  boolean attemptMark(V expectedReference, boolean newMark)   |               根据预期原值手动设置标记                |

应用AtomicMarkableReference的示例，一开始标记是false，中途修改为true

```java
public class Main {

    private static AtomicMarkableReference<Integer> i = new AtomicMarkableReference<>(0, false);

    public static void main(String[] args) {
        Thread thread = new Thread() {
            @Override
            public void run() {
                int oldValue = i.getReference();
                System.out.println(oldValue);
                boolean result = i.compareAndSet(0, 1, false, true);
                System.out.println(result);
                System.out.println(i.getReference());
            }
        };
        thread.start();
        i.set(1, true);
        i.set(0, true);
    }
}
```

输出：

> 0
> false
> 0

##### AtomicStampedReference

![AtomicStampedReference](../../../../images/posts/2025/08/multithread/pics/AtomicStampedReference.png)

|                            方法名                            |                          描述                          |
| :----------------------------------------------------------: | :----------------------------------------------------: |
|    AtomicStampedReference(V initialRef, int initialStamp)    | 创建指定初始值和初始版本号的AtomicStampedReference对象 |
|                   V get(int[] stampHolder)                   |     获取数据和版本号，版本号存储在数组第一个位置中     |
|            void set(V newReference, int newStamp)            |                    设置数据和版本号                    |
| boolean compareAndSet(V expectedReference, V newReference, int expectedStamp, int newStamp) |               以CAS方式更新数据和版本号                |
|                        int getStamp()                        |                     获取当前版本号                     |
|                       V getReference()                       |                        获取数据                        |
|   boolean attemptStamp(V expectedReference, int newStamp)    |               根据预期原值手动设置版本号               |

把原来程序中true和false的地方改为版本号

```java
public class Main {

    private static AtomicStampedReference<Integer> i = new AtomicStampedReference<>(0, 0);

    public static void main(String[] args) {
        Thread thread = new Thread() {
            @Override
            public void run() {
                int oldValue = i.getReference();
                System.out.println(oldValue);
                boolean result = i.compareAndSet(0, 1, 0, 1);
                System.out.println(result);
                System.out.println(i.getReference());
            }
        };
        thread.start();
        i.set(1, i.getStamp() + 1);
        i.set(0, i.getStamp() + 1);
    }
}
```

输出：

> 0
> false
> 0



#### CountDownLatch

##### 简介

CountDownLatch 是 Java 中的一个并发工具类，用于协调多个线程之间的同步。其作用是让某一个线程等待多个线程的操作完成之后再执行。它可以使一个或多个线程等待一组事件的发生，而其他的线程则可以触发这组事件。

##### 三个特性

1. CountDownLatch 可以用于控制一个或多个线程等待多个任务完成后再执行。

2. CountDownLatch 的计数器只能够被减少，不能够被增加。

3. CountDownLatch 的计数器初始值为正整数，每次调用 countDown() 方法会将计数器减 1，计数器为 0 时，等待线程开始执行。

##### 实现原理

CountDownLatch 的实现原理比较简单，它主要依赖于 AQS(AbstractQueuedSynchronizer)框架来实现线程的同步。

CountDownLatch 内部维护了一个计数器，该计数器初始值为 N，代表需要等待的线程数目，当一个线程完成了需要等待的任务后，就会调用 countDown() 方法将计数器减 1，当计数器的值为 0 时，等待的线程就会开始执行。

##### 适用场景

1. 主线程等待多个子线程完成任务后再继续执行。例如：一个大型的任务需要被拆分成多个子任务并交由多个线程并行处理，等所有子任务都完成后再将处理结果进行合并。

2. 启动多个线程并发执行任务，等待所有线程执行完毕后进行结果汇总。例如：在一个并发请求量比较大的 Web 服务中，可以使用 CountDownLatch 控制多个线程同时处理请求，等待所有线程处理完毕后将结果进行汇总。

3. 线程 A 等待线程 B 执行完某个任务后再执行自己的任务。例如：在多线程中，一个节点需要等待其他节点的加入后才能执行某个任务，可以使用 CountDownLatch 控制节点的加入，等所有节点都加入完成后再执行任务。

4. 多个线程等待一个共享资源的初始化完成后再进行操作。例如：在某个资源初始化较慢的系统中，可以使用 CountDownLatch 控制多个线程等待共享资源初始化完成后再进行操作。

CountDownLatch 适用于多线程任务的协同处理场景，能够有效提升多线程任务的执行效率，同时也能够降低多线程任务的复杂度和出错率。

##### 注意事项

1. CountDownLatch 对象的计数器只能减不能增，即一旦计数器为 0，就无法再重新设置为其他值，因此在使用时需要根据实际需要设置初始值。

2. CountDownLatch 的计数器是线程安全的，多个线程可以同时调用 countDown() 方法，而不会产生冲突。

3. 如果 CountDownLatch 的计数器已经为 0，再次调用 countDown() 方法也不会产生任何效果。

4. 如果在等待过程中，有线程发生异常或被中断，计数器的值可能不会减少到 0，因此在使用时需要根据实际情况进行异常处理。

5. CountDownLatch 可以与其他同步工具（如 Semaphore、CyclicBarrier）结合使用，实现更复杂的多线程同步。

##### 高并发示例

写一个任务

```java
public class Task implements Runnable {

    private final CountDownLatch countDownLatch;

    public Task(CountDownLatch countDownLatch) {
        this.countDownLatch = countDownLatch;
    }

    @Override
    public void run() {
        System.out.println(Thread.currentThread().getName());
        try {
            countDownLatch.await();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println(Thread.currentThread().getName());
    }
}
```

主线程

```java
public class Main {
    public static void main(String[] args) {
        CountDownLatch countDownLatch = new CountDownLatch(1);
        for (int i = 0; i < 5; i++) {
            Task task = new Task(countDownLatch);
            Thread thread = new Thread(task, "" + i);
            thread.start();
        }
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        countDownLatch.countDown();
    }
}
```

输出：

> 0
> 2
> 4
> 1
> 3
> 0
> 2
> 4
> 3
> 1

##### 秒杀示例

任务

```java
public class Task implements Runnable {

    private final CountDownLatch countDownLatch;

    private static boolean flag = false;

    public Task(CountDownLatch countDownLatch) {
        this.countDownLatch = countDownLatch;
    }

    @Override
    public void run() {
        System.out.println(Thread.currentThread().getName());
        try {
            countDownLatch.await();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        onlyOne();
    }

    private static synchronized void onlyOne() {
        if (!flag) {
            System.out.println("===>" + Thread.currentThread().getName());
            flag = true;
        }
    }
}
```

主线程

```java
public class Main {
    public static void main(String[] args) {
        CountDownLatch countDownLatch = new CountDownLatch(1);
        for (int i = 0; i < 5; ++i) {
            Task task = new Task(countDownLatch);
            Thread thread = new Thread(task, "" + i);
            thread.start();
        }
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        countDownLatch.countDown();
    }
}

```

输出：

> 0
> 3
> 1
> 2
> 4
> ===>3

##### 神秘代码

任务

```java
public class Task implements Runnable {

    // 计数器
    private final CountDownLatch countDownLatch;

    public Task(CountDownLatch countDownLatch) {
        this.countDownLatch = countDownLatch;
    }

    @Override
    public void run() {
        try {
            // 模拟下载时长
            Thread.sleep((long) (Math.random() * 1000));
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println(Thread.currentThread().getName());
        countDownLatch.countDown();
    }
}
```

主线程

```java
public class Main {
    public static void main(String[] args) {
        CountDownLatch countDownLatch = new CountDownLatch(3);
        for (int i = 0; i < 3; ++i) {
            Task task = new Task(countDownLatch);
            Thread thread = new Thread(task, "" + i);
            thread.start();
        }
        try {
            countDownLatch.await();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("main thread end");
    }
}
```

输出：

> 2
> 1
> 0
> main thread end



#### AbstractQueuedSynchronizer





#### cyclicBarrier

##### 定义



##### 示例

任务

```java
public class Task implements Runnable {

    private final CyclicBarrier cyclicBarrier;

    public Task(CyclicBarrier cyclicBarrier) {
        this.cyclicBarrier = cyclicBarrier;
    }

    @Override
    public void run() {
        try {
            // 模拟匹配时长
            Thread.sleep((long) (Math.random() * 3000));
            System.out.println(Thread.currentThread().getName() + "A");
            // 所有线程在此集合，一起往下执行
            cyclicBarrier.await();

            // 模拟准备时长
            Thread.sleep((long) (Math.random() * 3000));
            System.out.println(Thread.currentThread().getName() + "B");
            // 所有线程在此集合，一起往下执行
            cyclicBarrier.await();

            // 模拟加载时长
            Thread.sleep((long) (Math.random() * 3000));
            System.out.println(Thread.currentThread().getName() + "C");
            // 所有线程在此集合，一起往下执行
            cyclicBarrier.await();
        } catch (InterruptedException | BrokenBarrierException e) {
            e.printStackTrace();
        }
    }
}
```

主线程

```java
public class Main {
    public static void main(String[] args) {
        CyclicBarrier cyclicBarrier = new CyclicBarrier(5, new Runnable() {
            @Override
            public void run() {
                System.out.println(Thread.currentThread().getName());
            }
        });
        for (int i = 0; i < 5; i++) {
            Task task = new Task(cyclicBarrier);
            Thread thread = new Thread(task, "player" + i);
            thread.start();
        }
    }
}
```

输出：

> player0A
> player1A
> player4A
> player2A
> player3A
> player3
> player2B
> player0B
> player4B
> player3B
> player1B
> player1
> player2C
> player4C
> player1C
> player3C
> player0C
> player0



#### Exchanger

##### 定义



##### 示例

主线程

```java
public class Main {
    public static void main(String[] args) {
        // 交换器
        Exchanger<String> exchanger = new Exchanger<>();
        // 线程A
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    String A = "苹果";
                    // 与另一个线程进行交换，并得到另一个线程的数据
                    String B = exchanger.exchange(A);
                    System.out.println("A 交换过程：" + A + " ---> " + B);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }).start();
        // 线程B
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    String B = "香蕉";
                    // 与另一个线程进行交换，并得到另一个线程的数据
                    String A = exchanger.exchange(B);
                    System.out.println("B 交换过程：" + B + " ---> " + A);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }
}
```

输出：

> B 交换过程：香蕉 ---> 苹果
> A 交换过程：苹果 ---> 香蕉



#### Semaphore

##### 定义



##### 示例

任务

```java
public class Task implements Runnable {
    /**
     * 信号量
     */
    private final Semaphore semaphore;

    public Task(Semaphore semaphore) {
        this.semaphore = semaphore;
    }

    @Override
    public void run() {
        try {
            // 获取许可证
            semaphore.acquire();
            // 模拟业务时长
            Thread.sleep(2000);
            System.out.println(Thread.currentThread().getName() + "办好了～");
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            // 释放许可证
            semaphore.release();
        }
    }
}
```

主线程

```java
public class Main {
    public static void main(String[] args) {
        // 信号量
        Semaphore semaphore = new Semaphore(3);
        // 模拟并发
        for (int i = 0; i < 5; i++) {
            // 创建任务
            Task task = new Task(semaphore);
            // 创建线程
            Thread thread = new Thread(task, "客户" + i + "号");
            // 启动线程
            thread.start();
        }
    }
}
```

输出：

> 客户2号办好了～
> 客户1号办好了～
> 客户0号办好了～
> 客户4号办好了～
> 客户3号办好了～



#### Phaser

##### 定义



##### 示例

ReptilePhaser

```java
public class ReptilePhaser extends Phaser {

    public ReptilePhaser(int parties) {
        super(parties);
    }

    @Override
    protected boolean onAdvance(int phase, int registeredParties) {
        switch (phase) {
            case 0:
                System.out.println("第一阶段，收集完成！参与者数量：" + registeredParties);
                break;
            case 1:
                System.out.println("第二阶段，整理完成！参与者数量：" + registeredParties);
                break;
            default:
                break;
        }
        return super.onAdvance(phase, registeredParties);
    }
}
```

ReptileTask

```java
public class ReptileTask implements Runnable {
    /**
     * 阶段同步器
     */
    private final Phaser phaser;

    public ReptileTask(Phaser phaser) {
        this.phaser = phaser;
    }

    @Override
    public void run() {
        try {
            // 模拟爬虫时长
            Thread.sleep((long) (Math.random() * 3000));
            System.out.println(Thread.currentThread().getName() + "已爬完～");
            // 等待其他参与者
            phaser.arriveAndAwaitAdvance();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

ReduceTask

```java
public class ReduceTask implements Runnable {
    /**
     * 阶段同步器
     */
    private final Phaser phaser;

    public ReduceTask(Phaser phaser) {
        this.phaser = phaser;
    }

    @Override
    public void run() {
        try {
            // 模拟收集时长
            Thread.sleep((long) (Math.random() * 3000));
            System.out.println(Thread.currentThread().getName() + "收集完毕！");
            // 无需等待其他参与者
            phaser.arrive();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

主线程

```java
public class Main {

    public static void main(String[] args) {
        // 创建爬虫阶段同步器
        ReptilePhaser phaser = new ReptilePhaser(5);
        // 模拟并发
        for (int i = 1; i <= 5; i++) {
            // 创建任务
            ReptileTask task = new ReptileTask(phaser);
            // 创建线程
            Thread thread = new Thread(task, i + " 号线程");
            // 启动线程
            thread.start();
        }

        // 新增一个参与者
        phaser.register();
        // 等待其他参与者
        phaser.arriveAndAwaitAdvance();
        // 减少三个参与者
        phaser.arriveAndDeregister();
        phaser.arriveAndDeregister();
        phaser.arriveAndDeregister();

        // 模拟并发
        for (int i = 1; i <= 3; i++) {
            // 创建任务
            ReduceTask task = new ReduceTask(phaser);
            // 创建线程
            Thread thread = new Thread(task, i + " 号线程");
            // 启动线程
            thread.start();
        }
    }
}
```


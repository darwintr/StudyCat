"""
This recipe describes how to handle asynchronous I/O in an environment where
you are running tkinter as the graphical user interface. tkinter is safe
to use as long as all the graphics commands are handled in a single thread.
Since it is more efficient to make I/O channels to block and wait for something
to happen rather than poll at regular intervals, we want I/O to be handled
in separate threads. These can communicate in a threasafe way with the main,
GUI-oriented process through one or several queues. In this solution the GUI
still has to make a poll at a reasonable interval, to check if there is
something in the queue that needs processing. Other solutions are possible,
but they add a lot of complexity to the application.

Created by Jacob Hallen, AB Strakt, Sweden. 2001-10-17
"""
import tkinter
import time
import threading
import random
import queue

from PIL import ImageTk, Image

from Cat import Cat


class GuiPart:
    def __init__(self, master, queue, endCommand):
        self.queue = queue
        self.cat = Cat()

        # Windowless Mode.
        master.overrideredirect(1)

        # Set up the GUI
        console = tkinter.Button(master, text='Done', command=endCommand)
        img = self.cat.getImage()
        self.panel = tkinter.Label(master, image=img)
        self.label = tkinter.Label(master, text="Happiness: " + str(self.cat.getState()), fg=self.cat.getText())

        # Pack.
        self.panel.pack(side="top", fill="both", expand="yes")
        self.label.pack(side="top", fill="both", expand="yes")
        console.pack()

    def update(self):
        img = self.cat.getImage()
        text = "Happiness: " + str(self.cat.getState())

        self.panel.configure(image = img)
        self.panel.image = img

        self.label.configure(text = text, fg = self.cat.getText())
        self.label.text = text

    def processIncoming(self):
        """
        Handle all the messages currently in the queue (if any).
        """
        while self.queue.qsize():
            try:
                msg = self.queue.get(0)
                # Check contents of message and do what it says
                # As a test, we simply print it
                print(msg)
            except queue.Empty:
                pass

        self.update()


class ThreadedClient:
    """
    Launch the main part of the GUI and the worker thread. periodicCall and
    endApplication could reside in the GUI part, but putting them here
    means that you have all the thread controls in a single place.
    """
    def __init__(self, master):
        """
        Start the GUI and the asynchronous threads. We are in the main
        (original) thread of the application, which will later be used by
        the GUI. We spawn a new thread for the worker.
        """
        self.master = master

        # Create the queue
        self.queue = queue.Queue()

        # Set up the GUI part
        self.gui = GuiPart(master, self.queue, self.endApplication)

        # Set up the thread to do asynchronous I/O
        # More can be made if necessary
        self.running = 1
        self.thread1 = threading.Thread(target=self.workerThread1)
        self.thread1.start()

        # Start the periodic call in the GUI to check if the queue contains
        # anything
        self.periodicCall()

    def periodicCall(self):
        """
        Check every 100 ms if there is something new in the queue.
        """
        self.gui.processIncoming()
        if not self.running:
            # This is the brutal stop of the system. You may want to do
            # some cleanup before actually shutting it down.
            import sys
            sys.exit(1)
        self.master.after(100, self.periodicCall)

    def workerThread1(self):
        """
        This is where we handle the asynchronous I/O. For example, it may be
        a 'select()'.
        One important thing to remember is that the thread has to yield
        control.
        """
        while self.running:
            # To simulate asynchronous I/O, we create a random number at
            # random intervals. Replace the following 2 lines with the real
            # thing.
            time.sleep(rand.random() * 0.3)
            msg = rand.random()
            self.queue.put(msg)

    def endApplication(self):
        self.running = 0

rand = random.Random()
root = tkinter.Tk()

client = ThreadedClient(root)
root.mainloop()

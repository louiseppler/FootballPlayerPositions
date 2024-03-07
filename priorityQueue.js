//{const top=0,parent=c=>(c+1>>>1)-1,left=c=>(c<<1)+1,right=c=>c+1<<1;class PriorityQueue{constructor(c=(d,e)=>d>e){this._heap=[],this._comparator=c}size(){return this._heap.length}isEmpty(){return 0==this.size()}peek(){return this._heap[top]}push(...c){return c.forEach(d=>{this._heap.push(d),this._siftUp()}),this.size()}pop(){const c=this.peek(),d=this.size()-1;return d>top&&this._swap(top,d),this._heap.pop(),this._siftDown(),c}replace(c){const d=this.peek();return this._heap[top]=c,this._siftDown(),d}_greater(c,d){return this._comparator(this._heap[c],this._heap[d])}_swap(c,d){[this._heap[c],this._heap[d]]=[this._heap[d],this._heap[c]]}_siftUp(){for(let c=this.size()-1;c>top&&this._greater(c,parent(c));)this._swap(c,parent(c)),c=parent(c)}_siftDown(){for(let d,c=top;left(c)<this.size()&&this._greater(left(c),c)||right(c)<this.size()&&this._greater(right(c),c);)d=right(c)<this.size()&&this._greater(right(c),left(c))?right(c):left(c),this._swap(c,d),c=d}}window.PriorityQueue=PriorityQueue}
// code from https://stackoverflow.com/questions/42919469/efficient-way-to-implement-priority-queue-in-javascript
// more efficient implementation that does not work

//code partly from: https://www.delftstack.com/howto/javascript/priority-queue-javascript/

class QueueElement {
  constructor(element, priority) {
    this.element = element;
    this.priority = priority;
  }
}
class PriorityQueue {
  constructor() {
    this.queueItems = [];
  }
  enqueueFunction(element, priority) {
    let queueElement = new QueueElement(element, priority);
    let contain = false;

    for (let i = 0; i < this.queueItems.length; i++) {
      if (this.queueItems[i].priority > queueElement.priority) {
        this.queueItems.splice(i, 0, queueElement);
        contain = true;
        break;
      }
    }
    /* if the input element has the highest priority push it to end of the queue
     */
    if (!contain) {
      this.queueItems.push(queueElement);
    }
  }
  dequeueFunction() {
    /* returns the removed element from priority queue. */
    if (this.isPriorityQueueEmpty()) {
      return 'No elements present in Queue';
    }
    return this.queueItems.shift();
  }
  front() {
    /* returns the highest priority queue element without removing it. */
    if (this.isPriorityQueueEmpty()) {
      return 'No elements present in Queue';
    }
    return this.queueItems[0];
  }
  rear() {
    /* returns the lowest priority queue element without removing it. */
    if (this.isPriorityQueueEmpty()) {
      return 'No elements present in Queue';
    }
    return this.queueItems[this.queueItems.length - 1];
  }
  isPriorityQueueEmpty() {
    /* Checks the length of an queue */
    return this.queueItems.length === 0;
  }
  /* prints all the elements of the priority queue */
  printPriorityQueue() {
    let queueString = '';
    for (let i = 0; i < this.queueItems.length; i++)
      queueString += this.queueItems[i].element + ' ';
    return queueString;
  }

  updateElement(element, priority) {
    for(var i = 0; i < this.queueItems.length; i++) {

      if(this.compareElements(this.queueItems[i].element, element)) {
        this.queueItems[i].priority = priority;
      }

    }

    this.queueItems.sort((a, b) => a.priority - b.priority);
  }

  compareElements(elmA, elmB) {
    if(elmA.a == elmB.a && elmA.b == elmB.b) {
      return true
    }
    if(elmA.b == elmB.a && elmA.a == elmB.b) {
      return true
    }
    return false;
  }
}